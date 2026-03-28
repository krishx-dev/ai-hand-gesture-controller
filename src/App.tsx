import { useState, useCallback, useRef } from 'react';
import { TopBar }        from './components/TopBar';
import { WebcamCard }    from './components/WebcamCard';
import { GestureCard }   from './components/GestureCard';
import { ActionCard }    from './components/ActionCard';
import { ConfidenceCard }from './components/ConfidenceCard';
import { HistoryCard }   from './components/HistoryCard';
import { MetricsCard }   from './components/MetricsCard';
import { GestureMapCard }from './components/GestureMapCard';
import { SidebarPanel }  from './components/SidebarPanel';
import {
  GESTURE_CATALOG, mapGestureToAction, FPSCounter,
} from './utils/gestureEngine';
import type {
  GestureType, ActionType, GestureHistoryEntry,
  GestureUsageData, SystemMetrics, Settings,
  SystemStatus, WebcamStatus, Landmark,
} from './types';

const DEFAULT_SETTINGS: Settings = {
  sensitivity:     0.75,
  minConfidence:   0.65,
  showLandmarks:   true,
  showBoundingBox: true,
  autoAction:      true,
  soundFeedback:   false,
  hapticFeedback:  false,
  fpsLimit:        30,
  gestureDelay:    600,
};


/* ── Main App ──────────────────────────────────────────────── */
export function App() {
  const [isRunning,       setIsRunning]       = useState(false);
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [settings,        setSettings]        = useState<Settings>(DEFAULT_SETTINGS);
  const [cameraConnected, setCameraConnected] = useState(false);

  const [currentGesture,    setCurrentGesture]    = useState<GestureType>('none');
  const [currentAction,     setCurrentAction]     = useState<ActionType>('No Action');
  const [confidence,        setConfidence]        = useState(0);
  const [confidenceHistory, setConfidenceHistory] = useState<number[]>([]);
  const [gestureHistory,    setGestureHistory]    = useState<GestureHistoryEntry[]>([]);
  const [usageData,         setUsageData]         = useState<GestureUsageData[]>([]);
  const [enabledGestures,   setEnabledGestures]   = useState<Record<string, boolean>>(
    Object.fromEntries(GESTURE_CATALOG.map(g => [g.id, g.enabled]))
  );
  const [metrics,    setMetrics]    = useState<SystemMetrics>({
    fps: 0, latency: 0, cpuUsage: 0, accuracy: 0, uptime: 0, totalGestures: 0,
  });
  const [fpsHistory, setFpsHistory] = useState<{ t: string; fps: number; lat: number }[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('idle');
  const [webcamStatus, setWebcamStatus] = useState<WebcamStatus>('disconnected');

  const lastGestureTime      = useRef(0);
  const frameCountRef        = useRef(0);
  const fpsCounter           = useRef(new FPSCounter());
  const settingsRef          = useRef(settings);
  const enabledGesturesRef   = useRef(enabledGestures);
  settingsRef.current        = settings;
  enabledGesturesRef.current = enabledGestures;

  const resetToIdle = useCallback(() => {
    setCurrentGesture('none');
    setCurrentAction('No Action');
    setConfidence(0);
    setConfidenceHistory([]);
    setSystemStatus('idle');
    setMetrics(m => ({ ...m, fps: 0, latency: 0, cpuUsage: 0, accuracy: 0 }));
    setFpsHistory([]);
  }, []);

  const handleWebcamReady = useCallback((ready: boolean) => {
    setCameraConnected(ready);
    setWebcamStatus(ready ? 'connected' : 'error');
    setSystemStatus(ready ? 'active' : 'idle');
    if (!ready) resetToIdle();
  }, [resetToIdle]);

  const handleGestureDetected = useCallback((
    gesture: GestureType,
    conf:    number,
    _lms:    Landmark[]
  ) => {
    frameCountRef.current += 1;
    const fps = fpsCounter.current.tick();
    const now = Date.now();
    const s   = settingsRef.current;

    // Use ref so gesture toggle changes are always reflected
    // without stale closure and without restarting the camera
    if (gesture !== 'none' && !enabledGesturesRef.current[gesture]) return;
    if (gesture !== 'none' && conf < s.minConfidence)    return;

    const action = mapGestureToAction(gesture);
    setCurrentGesture(gesture);
    setCurrentAction(action);
    setConfidence(conf);
    setConfidenceHistory(h => [...h.slice(-59), conf]);

    if (gesture !== 'none' && now - lastGestureTime.current > s.gestureDelay) {
      lastGestureTime.current = now;
      const info = GESTURE_CATALOG.find(g => g.id === gesture);
      const entry: GestureHistoryEntry = {
        id:         `${now}-${Math.random()}`,
        gesture, action,
        name:       info?.name  ?? gesture,
        emoji:      info?.emoji ?? '?',
        confidence: conf,
        timestamp:  new Date(),
        color:      info?.color ?? '#5b8dee',
      };
      setGestureHistory(h => [...h.slice(-99), entry]);
      setUsageData(prev => {
        const key  = info?.name ?? gesture;
        const item = prev.find(d => d.name === key);
        if (item) return prev.map(d => d.name === key ? { ...d, count: d.count + 1 } : d);
        return [...prev, { name: key, count: 1, color: info?.color ?? '#5b8dee', emoji: info?.emoji ?? '?' }];
      });

    }

    const latency = Math.round(8 + Math.random() * 16);
    const cpu     = Math.round(18 + Math.random() * 22);
    setMetrics(m => ({
      fps:           fps || m.fps,
      latency,
      cpuUsage:      cpu,
      accuracy:      gesture !== 'none' ? conf : m.accuracy,
      uptime:        m.uptime + 1,
      totalGestures: m.totalGestures + (gesture !== 'none' ? 1 : 0),
    }));
    setFpsHistory(h => [
      ...h.slice(-39),
      { t: `${frameCountRef.current}`, fps: fps || 0, lat: latency },
    ]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSettingsChange = useCallback((key: keyof Settings, val: number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleToggleGesture = useCallback((id: string) => {
    setEnabledGestures(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const gestureInfo  = GESTURE_CATALOG.find(g => g.id === currentGesture);
  const gestureColor = gestureInfo?.color ?? '#3a4258';

  return (
    <div className="relative flex flex-col h-screen w-full overflow-hidden text-slate-200">
      {/* ── 1. Dynamic Ambient Background ── */}
      <div className="ambient-bg" />

      {/* ── 2. Master Responsive Constraint (1600px max) ── */}
      <div className="relative z-10 w-full max-w-[1700px] xl:max-w-screen-2xl mx-auto flex flex-col h-full">

        {/* ── 3. Application Header (Top Bar) ── */}
        <div className="relative z-20 shrink-0 px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <TopBar
            systemStatus={systemStatus}
            webcamStatus={webcamStatus}
            fps={metrics.fps}
            isRunning={isRunning}
            onToggleSidebar={() => setSidebarOpen(o => !o)}
            onToggleDetection={() => {
              const next = !isRunning;
              setIsRunning(next);
              if (!next) {
                resetToIdle();
                setCameraConnected(false);
                setWebcamStatus('disconnected');
              }
            }}
          />
        </div>

        {/* ── 4. Scrollable Main Content Grid ── */}
        <div className="flex flex-1 min-h-0 z-10 w-full px-4 sm:px-6 lg:px-8 pb-6 gap-0">

          {/* Scrollable main content — shrinks when sidebar is open */}
          <main className="flex-1 overflow-y-auto min-w-0 pt-4 custom-scrollbar transition-all duration-300" style={{ marginRight: sidebarOpen ? '8px' : '0' }}>
            
            {/* Upper Grid (Main Cards) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-8">
              
              {/* Col 1 (Spans 1 on LG, 2 on XL for huge webcam) */}
              <div className="lg:col-span-1 xl:col-span-2">
                <WebcamCard
                  isActive={isRunning}
                  settings={settings}
                  gestureColor={gestureColor}
                  cameraConnected={cameraConnected}
                  onWebcamReady={handleWebcamReady}
                  onGestureDetected={handleGestureDetected}
                />
              </div>

              {/* Col 2 */}
              <div className="flex flex-col gap-8 lg:col-span-1 xl:col-span-1">
                <GestureCard
                  gesture={currentGesture}
                  action={currentAction}
                  confidence={confidence}
                  cameraConnected={cameraConnected}
                />
                <ActionCard
                  action={currentAction}
                  gesture={currentGesture}
                  cameraConnected={cameraConnected}
                />
              </div>

              {/* Col 3 */}
              <div className="flex flex-col gap-8 lg:col-span-1 xl:col-span-1">
                <ConfidenceCard
                  confidence={confidence}
                  gesture={currentGesture}
                  confidenceHistory={confidenceHistory}
                  cameraConnected={cameraConnected}
                />
                <MetricsCard
                  metrics={metrics}
                  fpsHistory={fpsHistory}
                  cameraConnected={cameraConnected}
                />
              </div>
            </div>

            {/* Lower Grid (History & Settings Overview) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 mt-8">
              <HistoryCard history={gestureHistory} usageData={usageData} />
              <GestureMapCard activeGesture={currentGesture} enabledGestures={enabledGestures} />
            </div>
          </main>

          {/* ── Sidebar Settings — Push Drawer ─────────────────────────
               Flex sibling of <main>. When open it takes its own width
               in the row and main shrinks to fit. Zero overlap.
          ── */}
          <div
            className="flex-shrink-0 overflow-hidden transition-all duration-300"
            style={{ width: sidebarOpen ? '300px' : '0px' }}
          >
            {sidebarOpen && (
              <div className="h-full w-[300px] overflow-y-auto anim-slidein">
                <SidebarPanel
                  settings={settings}
                  onSettingsChange={handleSettingsChange}
                  enabledGestures={enabledGestures}
                  onToggleGesture={handleToggleGesture}
                  onClose={() => setSidebarOpen(false)}
                />
              </div>
            )}
          </div>

        </div>
      </div>


    </div>
  );
}
