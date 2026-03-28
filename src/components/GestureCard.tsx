import React, { useEffect, useState } from 'react';
import { Hand } from 'lucide-react';
import type { GestureType, ActionType } from '../types';
import { GESTURE_CATALOG } from '../utils/gestureEngine';

interface GestureCardProps {
  gesture:         GestureType;
  action:          ActionType;
  confidence:      number;
  cameraConnected: boolean;
}

export const GestureCard: React.FC<GestureCardProps> = ({
  gesture, action, confidence, cameraConnected,
}) => {
  const [animating, setAnimating] = useState(false);
  const [prev,      setPrev]      = useState(gesture);

  useEffect(() => {
    if (gesture !== prev) {
      setAnimating(true);
      const t = setTimeout(() => { setPrev(gesture); setAnimating(false); }, 220);
      return () => clearTimeout(t);
    }
  }, [gesture, prev]);

  const info  = GESTURE_CATALOG.find(g => g.id === gesture);
  const pct   = Math.round(confidence * 100);
  const color = info?.color ?? '#5c6b8a';
  const live  = cameraConnected && gesture !== 'none';

  const confColor =
    pct >= 80 ? '#3dd68c' :
    pct >= 60 ? '#f5a623' :
    pct > 0   ? '#e05c5c' :
    '#5c6b8a';

  return (
    <div className="glass-panel anim-fadeup flex-1 flex flex-col h-full" style={{ animationDelay: '0.1s' }}>
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900/60 border-t border-black/80 border-b border-white/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all" style={{
            background: live ? `${color}15` : 'rgba(0,0,0,0.3)',
            borderColor: live ? `${color}30` : 'rgba(0,0,0,0.8)',
            boxShadow: live ? `inset 0 2px 10px ${color}20, 0 0 10px ${color}10` : 'inset 0 2px 8px rgba(0,0,0,0.8)',
          }}>
            <Hand size={20} color={live ? color : 'var(--text-lo)'} className={live ? 'drop-shadow-sm' : ''} />
          </div>
          <div>
            <div className="text-[15px] font-extrabold text-white leading-tight tracking-wide drop-shadow-md">
              Current Gesture
            </div>
            <div className="text-[11px] font-mono font-bold leading-tight tracking-widest text-[#64748b] uppercase mt-0.5">
              {cameraConnected ? 'MediaPipe · Live' : 'Standby'}
            </div>
          </div>
        </div>

        {cameraConnected && (
          <div className="pill shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" style={{
            background: `${confColor}15`,
            border:     `1px solid ${confColor}40`,
            color:       confColor,
            fontSize:    13,
            fontWeight:  900,
          }}>
            {pct}%
          </div>
        )}
      </div>

      {/* Body */}
      <div className="panel-body gap-5 flex-1">

        {/* Deep Inset display */}
        <div className="inset-well flex flex-col items-center justify-center py-7 px-4 relative transition-all duration-300 min-h-[160px] flex-1"
          style={{
            background: live ? `linear-gradient(135deg, ${color}15, rgba(0,0,0,0.6))` : 'rgba(0,0,0,0.45)',
            border: `1px solid ${live ? `${color}30` : 'rgba(0,0,0,0.8)'}`,
            boxShadow: live ? `inset 0 2px 20px ${color}10, 0 1px 0 rgba(255,255,255,0.05)` : 'inset 0 2px 10px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05)',
          }}>
          {live && (
            <div className="absolute inset-0 pointer-events-none" style={{
              background: `radial-gradient(ellipse at 50% 80%, ${color}15, transparent 65%)`,
            }} />
          )}

          <span className="text-7xl z-10" style={{
            opacity:   animating ? 0 : 1,
            transform: animating ? 'scale(0.8) translateY(10px)' : 'scale(1) translateY(0)',
            transition:'opacity 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: live ? `drop-shadow(0 10px 20px ${color}50)` : 'drop-shadow(0 10px 15px rgba(0,0,0,0.8))',
          }}>
            {info?.emoji ?? '🤚'}
          </span>

          <span className="text-[15px] font-extrabold tracking-wide mt-3 z-10" style={{
            color: live ? '#fff' : 'var(--text-lo)',
            opacity:   animating ? 0 : 1,
            transform: animating ? 'translateY(8px)' : 'translateY(0)',
            transition:'opacity 0.22s, transform 0.22s',
            textShadow: live ? `0 0 15px ${color}` : 'none',
          }}>
            {gesture !== 'none' ? info?.name : 'No Gesture Detected'}
          </span>

          {live && (
            <span className="text-[11px] font-bold text-slate-300 tracking-wider uppercase mt-2 bg-black/50 px-4 py-1.5 rounded-full border-t border-white/20 border-b border-black/50 z-10 backdrop-blur-md shadow-inner">
              Trigger: {action}
            </span>
          )}

          {!cameraConnected && (
            <span className="text-[10px] font-mono font-black tracking-[0.2em] text-[#64748b] mt-3 bg-black/40 px-3 py-1 rounded-md border border-white/5">
              OFFLINE
            </span>
          )}
        </div>

        {/* Confidence bar */}
        <div className="mt-auto">
          <div className="flex justify-between items-end mb-2.5 px-1">
            <span className="text-label">Confidence Rating</span>
            <span className="text-sm font-mono font-black" style={{ color: confColor }}>
              {cameraConnected ? `${pct}%` : '---'}
            </span>
          </div>
          <div className="prog-track h-2 bg-[#090e17] border border-white/5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] rounded-full overflow-hidden">
            <div className="prog-fill shadow-[0_0_10px_currentColor] transition-all duration-300 rounded-full" style={{
              width: `${cameraConnected ? pct : 0}%`,
              background: live ? `linear-gradient(90deg, ${confColor}80, ${confColor})` : 'transparent',
              color: confColor,
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};
