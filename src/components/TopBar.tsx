import React, { useEffect, useState } from 'react';
import { Hand, Wifi, WifiOff, Settings, Play, Square, Activity } from 'lucide-react';
import type { SystemStatus, WebcamStatus } from '../types';

interface TopBarProps {
  systemStatus:      SystemStatus;
  webcamStatus:      WebcamStatus;
  fps:               number;
  isRunning:         boolean;

  onToggleSidebar:   () => void;
  onToggleDetection: () => void;
}

const SYS: Record<SystemStatus, { color: string; label: string }> = {
  active:       { color: '#3dd68c',  label: 'Active'  },
  idle:         { color: '#7a8599',  label: 'Standby' },
  error:        { color: '#e05c5c',  label: 'Error'   },
  initializing: { color: '#f5a623',  label: 'Init…'   },
};

const CAM: Record<WebcamStatus, { color: string; label: string; online: boolean }> = {
  connected:    { color: '#3dd68c', label: 'Camera Live',    online: true  },
  disconnected: { color: '#7a8599', label: 'Camera Offline', online: false },
  connecting:   { color: '#f5a623', label: 'Connecting',     online: false },
  error:        { color: '#e05c5c', label: 'Camera Error',   online: false },
};

export const TopBar: React.FC<TopBarProps> = ({
  systemStatus, webcamStatus, fps,
  isRunning,
  onToggleSidebar, onToggleDetection,
}) => {
  const [time,   setTime]   = useState(new Date());
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const t1 = setInterval(() => setTime(new Date()), 1000);
    const t2 = setInterval(() => setUptime(u => u + 1), 1000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const sys = SYS[systemStatus];
  const cam = CAM[webcamStatus];
  const fmt = (s: number) =>
    `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <header className="glass-panel flex items-center justify-between px-6 py-4 flex-col sm:flex-row gap-5 sm:gap-0 w-full min-h-[76px]">
      
      {/* ── Left: Brand ── */}
      <div className="flex items-center gap-4">
        {/* Soft inset well for brand logo */}
        <div className="w-10 h-10 rounded-xl bg-slate-900/60 border-t border-black/80 border-b border-white/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] flex items-center justify-center shrink-0">
          <Hand size={20} className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-sm font-extrabold text-white leading-tight tracking-wide drop-shadow-md">
            Gesture Engine OS
          </h1>
          <span className="text-[10px] font-mono font-bold text-[#64748b] leading-tight tracking-widest uppercase mt-0.5">
            MediaPipe · Vision
          </span>
        </div>
      </div>

      {/* ── Center: Status indicators (Tactile Inset style) ── */}
      <div className="flex flex-wrap items-center justify-center gap-4 border-l border-white/5 pl-4 sm:border-0 sm:pl-0">
        {/* System */}
        <div className="inset-well flex items-center gap-2 px-3 py-1.5 h-8 transition-all duration-300 pointer-events-none shrink-0">
          <span className="dot pulse w-2 h-2 rounded-full" style={{ background: sys.color, boxShadow:`0 0 8px ${sys.color}` }} />
          <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: sys.color }}>{sys.label}</span>
        </div>

        {/* Camera */}
        <div className="inset-well flex items-center gap-2 px-3 py-1.5 h-8 transition-all duration-300 pointer-events-none shrink-0">
          {cam.online ? <Wifi size={14} className="drop-shadow-sm" style={{ color: cam.color }} /> : <WifiOff size={14} style={{ color: cam.color }} />}
          <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: cam.color }}>{cam.label}</span>
        </div>

        {/* FPS */}
        {fps > 0 && (
          <div className="inset-well hidden lg:flex items-center gap-2 px-3 py-1.5 h-8 anim-popin shrink-0">
            <Activity size={14} className="text-blue-400" />
            <span className="text-[13px] font-mono font-black text-white">{fps}</span>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">FPS</span>
          </div>
        )}
      </div>

      {/* ── Right: Physical Controls ── */}
      <div className="flex items-center gap-5">
        {/* Clock + uptime */}
        <div className="hidden lg:flex flex-col text-right justify-center">
          <div className="text-[12px] font-mono font-black text-white tracking-wider drop-shadow-sm leading-tight">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </div>
          <div className="text-[10px] font-mono font-bold text-slate-500 tracking-widest mt-0.5 leading-tight uppercase">
            UP {fmt(uptime)}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tactile Start/Stop */}
          <button
            onClick={onToggleDetection}
            className={`btn-skeuo h-10 px-6 text-[11px] font-black tracking-widest uppercase shrink-0 ${
              isRunning ? 'btn-skeuo-red' : 'btn-skeuo-blue'
            }`}
          >
            {isRunning
              ? <><Square size={14} fill="currentColor" /> Stop</>
              : <><Play size={14} fill="currentColor" /> Start</>}
          </button>



          {/* Settings */}
          <button onClick={onToggleSidebar} className="btn-skeuo w-10 h-10 !p-0 shrink-0 flex items-center justify-center group">
            <Settings size={18} className="text-slate-300 drop-shadow-sm group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
