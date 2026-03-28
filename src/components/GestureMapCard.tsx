import React from 'react';
import { Grid } from 'lucide-react';
import { GESTURE_CATALOG } from '../utils/gestureEngine';
import type { GestureType } from '../types';

interface Props {
  activeGesture:   GestureType;
  enabledGestures: Record<string, boolean>;
}

export const GestureMapCard: React.FC<Props> = ({ activeGesture, enabledGestures }) => {
  const gestures    = GESTURE_CATALOG.filter(g => g.id !== 'none');
  const activeCount = Object.values(enabledGestures).filter(Boolean).length;

  return (
    <div className="glass-panel anim-fadeup flex-1 flex flex-col h-[400px]" style={{ animationDelay:'0.4s' }}>
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900/60 border-t border-black/80 border-b border-white/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all" style={{
            background: 'rgba(139,108,247,0.15)', borderColor: 'rgba(139,108,247,0.3)',
            boxShadow: 'inset 0 2px 10px rgba(139,108,247,0.2), 0 0 10px rgba(139,108,247,0.1)',
          }}>
            <Grid size={20} color="#8b6cf7" className="drop-shadow-sm" />
          </div>
          <div>
            <div className="text-[15px] font-extrabold text-white leading-tight tracking-wide drop-shadow-md">Gesture Map</div>
            <div className="text-[11px] font-mono font-bold leading-tight tracking-widest text-[#64748b] uppercase mt-0.5">
              {activeCount}/{gestures.length} enabled
            </div>
          </div>
        </div>
        <div className="pill shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] bg-purple-500/15 border border-purple-500/40 text-[#c084fc] font-black tracking-widest text-xs">
          v2.5
        </div>
      </div>

      <div className="panel-body overflow-y-auto custom-scrollbar flex-1 pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {gestures.map(g => {
            const isActive  = g.id === activeGesture;
            const isEnabled = enabledGestures[g.id] !== false;

            return (
              <div key={g.id} className="inset-well relative flex flex-col items-center justify-center p-4 transition-all duration-300 group cursor-default" style={{
                background: isActive
                  ? `linear-gradient(135deg, ${g.color}30, rgba(0,0,0,0.6))`
                  : isEnabled ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.8)',
                borderColor: isActive ? `${g.color}50` : 'rgba(0,0,0,0.8)',
                opacity:   isEnabled ? 1 : 0.4,
                transform: isActive ? 'scale(1.05) translateY(-2px)' : 'scale(1)',
                boxShadow: isActive ? `0 12px 30px -5px ${g.color}40, inset 0 2px 15px ${g.color}20, 0 1px 0 rgba(255,255,255,0.1)` : 'inset 0 2px 10px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05)',
                zIndex: isActive ? 10 : 1,
              }}>
                <span className="text-4xl leading-none transition-all duration-300 drop-shadow-md group-hover:scale-110" style={{
                  filter: isActive ? `drop-shadow(0 5px 15px ${g.color}80)` : 'none',
                }}>
                  {g.emoji}
                </span>
                <span className="text-xs font-black text-center leading-tight mt-3 transition-colors tracking-wide drop-shadow-sm" style={{
                  color: isActive ? '#fff' : isEnabled ? 'var(--text-hi)' : 'var(--text-lo)',
                  textShadow: isActive ? `0 0 10px ${g.color}` : 'none'
                }}>
                  {g.name}
                </span>
                <span className="text-[10px] text-center leading-tight uppercase font-bold tracking-widest mt-1.5 opacity-80" style={{ color: isActive ? g.color : 'var(--text-lo)' }}>
                  {g.action}
                </span>
                {isActive && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full pulse anim-blink shadow-[0_0_10px_currentColor] border border-white/40" style={{ background: g.color, color: g.color }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
