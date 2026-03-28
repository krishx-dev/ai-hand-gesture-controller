// ── WebcamCard — Real MediaPipe Hands detection ──────────────────
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, Maximize2, RefreshCw, CameraOff } from 'lucide-react';
import { drawLandmarksOnCanvas, classifyLandmarks } from '../utils/gestureEngine';
import type { GestureType, Landmark, Settings } from '../types';

declare global {
  interface Window {
    Hands: new (cfg: Record<string, unknown>) => MediaPipeHands;
    Camera: new (
      v: HTMLVideoElement,
      cfg: { onFrame: () => Promise<void>; width: number; height: number }
    ) => { start: () => void; stop: () => void };
  }
}
interface MediaPipeHands {
  setOptions: (o: Record<string, unknown>) => void;
  onResults:  (cb: (r: MediaPipeResults) => void) => void;
  send:       (i: { image: HTMLVideoElement }) => Promise<void>;
  close:      () => void;
}
interface MediaPipeResults {
  multiHandLandmarks?: Array<Array<{ x: number; y: number; z: number }>>;
}

interface Props {
  isActive:          boolean;
  settings:          Settings;
  gestureColor:      string;
  cameraConnected:   boolean;
  onWebcamReady:     (ready: boolean) => void;
  onGestureDetected: (gesture: GestureType, confidence: number, landmarks: Landmark[]) => void;
}

// ── CDN loader (singleton) ────────────────────────────────────────
let mpLoaded  = false;
let mpLoading = false;
const mpCbs: Array<() => void> = [];

function loadMediaPipe(): Promise<void> {
  return new Promise(resolve => {
    if (mpLoaded) { resolve(); return; }
    mpCbs.push(resolve);
    if (mpLoading) return;
    mpLoading = true;
    const load = (src: string) =>
      new Promise<void>((res, rej) => {
        const s = document.createElement('script');
        s.src = src; s.onload = () => res(); s.onerror = () => rej(new Error(src));
        document.head.appendChild(s);
      });
    (async () => {
      try {
        await load('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
        await load('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        mpLoaded = true;
      } catch { /* will show error */ }
      mpCbs.forEach(cb => cb()); mpCbs.length = 0;
    })();
  });
}

export const WebcamCard: React.FC<Props> = ({
  isActive, settings, gestureColor, cameraConnected,
  onWebcamReady, onGestureDetected,
}) => {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const cardRef     = useRef<HTMLDivElement>(null);
  const handsRef    = useRef<MediaPipeHands | null>(null);
  const mpCamRef    = useRef<{ start: () => void; stop: () => void } | null>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const rafRef      = useRef<number>(0);
  const fpsFrames   = useRef<number[]>([]);
  const lmsRef      = useRef<Landmark[]>([]);
  const colorRef    = useRef(gestureColor);
  const settingsRef = useRef(settings);

  // ── Keep callback refs current so MediaPipe onResults always
  //    calls the latest prop without restarting the camera ──────
  const onGestureDetectedRef = useRef(onGestureDetected);
  const onWebcamReadyRef     = useRef(onWebcamReady);

  // Sync refs every render (safe: refs don't cause re-renders)
  colorRef.current             = gestureColor;
  settingsRef.current          = settings;
  onGestureDetectedRef.current = onGestureDetected;
  onWebcamReadyRef.current     = onWebcamReady;

  // Cancelation token: set to true by stopAll so any in-flight
  // startDetection await chain exits immediately ────────────────
  const canceledRef = useRef(false);

  const [camErr,    setCamErr]    = useState<string | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [mpReady,   setMpReady]   = useState(false);
  const [hasHand,   setHasHand]   = useState(false);
  const [fps,       setFps]       = useState(0);

  const tickFps = useCallback(() => {
    const now = performance.now();
    fpsFrames.current.push(now);
    if (fpsFrames.current.length > 60) fpsFrames.current.shift();
    if (fpsFrames.current.length < 2) return 0;
    const dt = (fpsFrames.current[fpsFrames.current.length-1] - fpsFrames.current[0]) / 1000;
    return Math.round((fpsFrames.current.length-1) / dt);
  }, []);

  const stopAll = useCallback(() => {
    // Signal any in-progress startDetection to abort
    canceledRef.current = true;

    cancelAnimationFrame(rafRef.current);
    if (mpCamRef.current)  { try { mpCamRef.current.stop();  } catch { /**/ } mpCamRef.current  = null; }
    if (handsRef.current)  { try { handsRef.current.close(); } catch { /**/ } handsRef.current  = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (videoRef.current)  videoRef.current.srcObject = null;
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    lmsRef.current = [];
    setHasHand(false);
    setStreaming(false);
    setMpReady(false);
    fpsFrames.current = [];
    setFps(0);
  }, []);

  const renderLoop = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(renderLoop); return;
    }
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) { rafRef.current = requestAnimationFrame(renderLoop); return; }

    // Mirror
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Subtle vignette
    const vig = ctx.createRadialGradient(
      canvas.width/2, canvas.height/2, canvas.height*0.3,
      canvas.width/2, canvas.height/2, canvas.height*0.85
    );
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(1, 'rgba(13,15,20,0.5)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Landmarks
    if (lmsRef.current.length > 0 && settingsRef.current.showLandmarks) {
      drawLandmarksOnCanvas(
        ctx, lmsRef.current, canvas.width, canvas.height,
        settingsRef.current.showBoundingBox, colorRef.current
      );
    }
    setFps(tickFps());
    rafRef.current = requestAnimationFrame(renderLoop);
  }, [tickFps]);

  const startDetection = useCallback(async () => {
    // Reset cancelation token for this new detection session
    canceledRef.current = false;

    setLoading(true); setCamErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal:640 }, height: { ideal:480 }, facingMode:'user' },
        audio: false,
      });

      // Check if canceled while awaiting getUserMedia
      if (canceledRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = stream;
      if (!videoRef.current) throw new Error('Video element not mounted');
      videoRef.current.srcObject = stream;
      await new Promise<void>((res, rej) => {
        const v = videoRef.current!;
        v.onloadedmetadata = () => v.play().then(res).catch(rej);
        v.onerror          = () => rej(new Error('Video error'));
        setTimeout(() => rej(new Error('Camera timeout')), 10_000);
      });

      // Check if canceled while video was loading
      if (canceledRef.current) { stopAll(); return; }

      await loadMediaPipe();

      // Check if canceled while MediaPipe was loading
      if (canceledRef.current) { stopAll(); return; }

      if (!window.Hands) throw new Error('MediaPipe unavailable — check internet connection');

      const hands = new window.Hands({
        locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
      });
      hands.setOptions({
        maxNumHands: 1, modelComplexity: 1,
        minDetectionConfidence: 0.6, minTrackingConfidence: 0.5,
      });

      // Use ref-based callbacks so:
      // 1. gesture toggle changes (enabledGestures) are always reflected
      // 2. the camera does NOT need to restart when a prop changes
      hands.onResults((results: MediaPipeResults) => {
        if (results.multiHandLandmarks?.length) {
          const raw = results.multiHandLandmarks[0];
          const lms: Landmark[] = raw.map(p => ({ x: p.x, y: p.y, z: p.z }));
          lmsRef.current = lms;
          setHasHand(true);
          const { gesture, confidence } = classifyLandmarks(lms, settingsRef.current);
          onGestureDetectedRef.current(gesture, confidence, lms);
        } else {
          lmsRef.current = [];
          setHasHand(false);
          onGestureDetectedRef.current('none', 0, []);
        }
      });
      handsRef.current = hands;

      if (window.Camera) {
        const mc = new window.Camera(videoRef.current!, {
          onFrame: async () => {
            if (handsRef.current && videoRef.current)
              await handsRef.current.send({ image: videoRef.current });
          },
          width: 640, height: 480,
        });
        mpCamRef.current = mc; mc.start();
      } else {
        const loop = async () => {
          const v = videoRef.current;
          if (handsRef.current && v && v.readyState >= 2)
            await handsRef.current.send({ image: v });
          rafRef.current = requestAnimationFrame(loop as unknown as FrameRequestCallback);
        };
        loop();
      }

      setMpReady(true); setStreaming(true); setLoading(false);
      onWebcamReadyRef.current(true);
      rafRef.current = requestAnimationFrame(renderLoop);
    } catch (err) {
      if (canceledRef.current) return; // silently ignore if we were stopped
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setCamErr(
        msg.toLowerCase().includes('denied') || msg.toLowerCase().includes('permission')
          ? 'Camera permission denied. Please allow camera access and retry.'
          : msg.toLowerCase().includes('timeout')
          ? 'Camera timed out. Please retry.'
          : `Error: ${msg}`
      );
      setLoading(false); stopAll(); onWebcamReadyRef.current(false);
    }
  }, [renderLoop, stopAll]); // stable — callbacks accessed via refs

  useEffect(() => {
    if (isActive) startDetection();
    else { stopAll(); onWebcamReadyRef.current(false); }
    return () => stopAll();
  }, [isActive, startDetection, stopAll]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFs = () => {
    if (!document.fullscreenElement && cardRef.current) cardRef.current.requestFullscreen();
    else document.exitFullscreen();
  };

  return (
    <div ref={cardRef} className="glass-panel anim-fadeup h-full" style={{ animationDelay:'0.05s' }}>
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <div className="icon-badge transition-all" style={{
            background: streaming ? 'rgba(91,141,238,0.15)' : 'rgba(255,255,255,0.05)',
            borderColor: streaming ? 'rgba(91,141,238,0.3)' : 'var(--glass-border)',
            boxShadow: streaming ? '0 0 12px rgba(91,141,238,0.2)' : 'none'
          }}>
            {streaming
              ? <Camera    size={20} className="text-blue-400" />
              : <CameraOff size={20} className="text-slate-400" />}
          </div>
          <div>
            <div className="text-[15px] font-extrabold text-white leading-tight">
              Live Camera Feed
            </div>
            <div className={`text-[11px] font-mono leading-tight tracking-wide ${streaming ? 'text-blue-400' : 'text-slate-400'}`}>
              {streaming
                ? `● LIVE · ${fps} fps${mpReady ? ' · MediaPipe OK' : ''}`
                : '○ Offline'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {streaming && hasHand && cameraConnected && (
            <div className="pill bg-green-500/15 border border-green-500/30 text-green-400 shadow-[0_0_10px_rgba(61,214,140,0.15)] anim-popin">
              <span className="dot pulse bg-green-400" />
              HAND
            </div>
          )}
          {camErr && (
            <button onClick={startDetection} title="Retry" className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors shadow-sm">
              <RefreshCw size={16} className="text-red-400" />
            </button>
          )}
          {streaming && (
            <button onClick={toggleFs} title="Fullscreen" className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-sm">
              <Maximize2 size={16} className="text-slate-300" />
            </button>
          )}
        </div>
      </div>

      {/* Feed area */}
      <div className="panel-body relative pt-0">
        <div className="inset-well relative overflow-hidden aspect-video w-full transition-colors duration-300 group"
          style={{ borderColor: streaming ? 'rgba(91,141,238,0.3)' : 'rgba(255,255,255,0.05)' }}>
          {/* Hidden video source */}
          <video ref={videoRef} muted playsInline className="absolute inset-0 w-full h-full opacity-0 pointer-events-none" />

          {/* Canvas output */}
          <canvas ref={canvasRef}
            className={`absolute inset-0 w-full h-full rounded-2xl transition-opacity duration-300 ease-in-out ${streaming ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* HUD corners */}
          {streaming && (
            <>
              <div className="cc cc-tl" /><div className="cc cc-tr" />
              <div className="cc cc-bl" /><div className="cc cc-br" />
            </>
          )}

          {/* Offline placeholder */}
          {!loading && !streaming && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 bg-transparent">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg backdrop-blur-md">
                <CameraOff size={28} className="text-slate-400" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-slate-300">
                  {camErr ? 'Camera Unavailable' : 'Camera Off'}
                </p>
                <p className="text-[11px] text-slate-400 max-w-[200px] leading-relaxed">
                  {camErr ?? 'Press Start in the top bar to begin detecting hands'}
                </p>
              </div>
              {camErr && (
                <button onClick={startDetection} className="flex items-center gap-2 px-4 py-2 mt-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold hover:bg-blue-500/25 transition-all shadow-[0_0_15px_rgba(91,141,238,0.2)]">
                  <RefreshCw size={14} /> Retry Connection
                </button>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/80 backdrop-blur-md z-10">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/10 shadow-[0_0_20px_rgba(91,141,238,0.2)]" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 anim-spin" />
              </div>
              <p className="text-xs font-mono font-semibold text-blue-400 drop-shadow-[0_0_8px_rgba(91,141,238,0.8)] mt-2">
                Loading MediaPipe…
              </p>
              <p className="text-[10px] font-mono text-slate-400 tracking-wide">
                Initializing hand detection AI model
              </p>
            </div>
          )}

          {/* Live HUD overlays */}
          {streaming && (
            <>
              {/* REC */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
                <span className="anim-blink w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444] shrink-0" />
                <span className="text-[10px] font-mono font-bold text-red-400 tracking-wider">REC</span>
              </div>

              {/* Hand tracked badge */}
              {hasHand && cameraConnected && (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-green-500/20 shadow-[0_0_10px_rgba(61,214,140,0.15)]">
                  <span className="text-[10px] font-mono font-bold text-green-400 tracking-wider">
                    HAND TRACKED
                  </span>
                </div>
              )}

              {/* Bottom left */}
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-mono text-slate-300">
                  MediaPipe · 21 lm
                </span>
              </div>

              {/* FPS */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 shadow-[0_0_8px_rgba(0,0,0,0.4)]">
                <span className="text-[11px] font-mono font-bold text-blue-400 shadow-blue-400/20">
                  {fps} fps
                </span>
              </div>
            </>
          )}
        </div>

        {/* Tip */}
        {streaming && (
          <p className="mt-4 text-center text-[11px] text-slate-400 tracking-wide font-medium bg-white/5 py-1.5 px-4 rounded-xl border border-white/5 inline-block mx-auto">
            Keep your hand clearly in frame · Good lighting improves accuracy
          </p>
        )}
      </div>
    </div>
  );
};
