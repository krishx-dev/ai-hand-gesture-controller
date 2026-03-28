import React, { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';
import type { ActionType, GestureType } from '../types';
import { GESTURE_CATALOG } from '../utils/gestureEngine';

interface ActionCardProps {
  action:          ActionType;
  gesture:         GestureType;
  cameraConnected: boolean;
}

const CFG: Record<string, { icon: string; color: string; desc: string }> = {
  'Volume Up':       { icon: '🔊', color: '#3dd68c',  desc: 'System volume +'    },
  'Volume Down':     { icon: '🔉', color: '#e05c5c',  desc: 'System volume –'    },
  'Play / Pause':    { icon: '⏯️', color: '#5b8dee',  desc: 'Media toggled'      },
  'Previous Track':  { icon: '⏮️', color: '#f5a623',  desc: 'Prev track'         },
  'Next Track':      { icon: '⏭️', color: '#2ec4b6',  desc: 'Next track'         },
  'Scroll Up':       { icon: '⬆️', color: '#8b6cf7',  desc: 'Page scroll up'    },
  'Scroll Down':     { icon: '⬇️', color: '#06b6d4',  desc: 'Page scroll down'  },
  'Take Screenshot': { icon: '📸', color: '#f472b6',  desc: 'Screenshot'         },
  'Open Browser':    { icon: '🌐', color: '#2ec4b6',  desc: 'Browser opened'     },
  'Select / Click':  { icon: '🖱️', color: '#f5a623',  desc: 'Click exec'         },
  'Brightness Up':   { icon: '☀️', color: '#fcd34d',  desc: 'Screen brighter'   },
  'Brightness Down': { icon: '🌙', color: '#f59e0b',  desc: 'Screen dimmer'     },
  'Mute':            { icon: '🔇', color: '#6ee7b7',  desc: 'Audio muted'        },
  'Zoom In':         { icon: '🔍', color: '#c084fc',  desc: 'Zoom in'            },
  'Zoom Out':        { icon: '🔎', color: '#d8b4fe',  desc: 'Zoom out'           },
  'Navigate Home':   { icon: '🏠', color: '#67e8f9',  desc: 'Go to home'         },
  'Like / Favorite': { icon: '❤️', color: '#f9a8d4',  desc: 'Liked'              },
  'Confirm':         { icon: '✅', color: '#86efac',  desc: 'Confirmed'          },
  'Cancel':          { icon: '❌', color: '#cbd5e1',  desc: 'Cancelled'          },
  'Peace ✌️':        { icon: '✌️', color: '#a78bfa',  desc: 'Peace sign'         },
  'No Action':       { icon: '—',  color: '#64748b',  desc: 'Awaiting…'          },
};

export const ActionCard: React.FC<ActionCardProps> = ({ action, gesture, cameraConnected }) => {
  const [flash, setFlash] = useState(false);
  const [last,  setLast]  = useState(action);

  useEffect(() => {
    if (cameraConnected && action !== last && action !== 'No Action') {
      setFlash(true);
      setTimeout(() => setFlash(false), 450);
      setLast(action);
    }
    if (!cameraConnected) setLast('No Action');
  }, [action, last, cameraConnected]);

  const info = GESTURE_CATALOG.find(g => g.id === gesture);
  const cfg  = CFG[action] ?? CFG['No Action'];
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  const live = cameraConnected && action !== 'No Action';

  return (
    <div className="glass-panel anim-fadeup flex-1 flex flex-col h-full" style={{ animationDelay: '0.2s' }}>
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900/60 border-t border-black/80 border-b border-white/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all" style={{
            background: live ? `${cfg.color}15` : 'rgba(0,0,0,0.3)',
            borderColor: live ? `${cfg.color}30` : 'rgba(0,0,0,0.8)',
            boxShadow: live ? `inset 0 2px 10px ${cfg.color}20, 0 0 10px ${cfg.color}10` : 'inset 0 2px 8px rgba(0,0,0,0.8)',
          }}>
            <Terminal size={20} color={live ? cfg.color : 'var(--text-lo)'} className={live ? 'drop-shadow-sm' : ''} />
          </div>
          <div>
            <div className="text-[15px] font-extrabold text-white leading-tight tracking-wide drop-shadow-md">
              System Action
            </div>
            <div className="text-[11px] font-mono font-bold leading-tight tracking-widest text-[#64748b] uppercase mt-0.5">
              {cameraConnected ? 'Executor · Live' : 'Standby'}
            </div>
          </div>
        </div>

        {live && (
          <div className="pill anim-popin shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] bg-green-500/15 border border-green-500/40 text-[#4ade80] text-[13px] font-black tracking-wide">
            <span className="dot pulse bg-[#4ade80] shadow-[0_0_8px_#4ade80]" />
            EXECUTED
          </div>
        )}
      </div>

      {/* Body */}
      <div className="panel-body gap-5 flex-1">

        {/* Deep Inset Action display */}
        <div className="inset-well flex flex-col items-center justify-center py-7 px-4 transition-all duration-300 relative overflow-hidden flex-1 min-h-[160px]" style={{
            background: flash ? `linear-gradient(135deg, ${cfg.color}25, rgba(0,0,0,0.6))` : 'rgba(0,0,0,0.45)',
            border: `1px solid ${flash ? `${cfg.color}50` : 'rgba(0,0,0,0.8)'}`,
            boxShadow: flash ? `inset 0 2px 20px ${cfg.color}30, 0 1px 0 rgba(255,255,255,0.05)` : 'inset 0 2px 10px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05)',
        }}>
          {flash && (
             <div className="absolute inset-0 bg-white/5 pointer-events-none animate-pulse" />
          )}
          <span className="text-[55px] leading-tight drop-shadow-lg z-10 transition-transform duration-300" style={{ transform: flash ? 'scale(1.15)' : 'scale(1)' }}>
            {cfg.icon}
          </span>
          <span className="text-[15px] font-extrabold tracking-wide mt-3 z-10 transition-colors duration-300" style={{
            color: live ? '#fff' : 'var(--text-lo)',
            textShadow: live ? `0 0 15px ${cfg.color}` : 'none',
          }}>
            {action}
          </span>
          <span className="text-[11px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest bg-black/50 px-3 py-1 rounded-md border border-white/5 shadow-inner z-10">
            {cfg.desc}
          </span>
        </div>

        {/* Meta Dashboard row */}
        <div className="grid grid-cols-2 gap-4 mt-auto">
          {[
            { label: 'Trigger source', value: info ? `${info.emoji} ${info.name}` : 'None' },
            { label: 'Timestamp',      value: time },
          ].map(({ label, value }) => (
            <div key={label} className="inset-well p-3 flex flex-col justify-center border-t border-black/80">
              <div className="text-label mb-1">{label}</div>
              <div className="text-sm font-black font-mono text-value drop-shadow-sm truncate">
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Terminal readout line */}
        <div className="inset-well p-3 flex items-center gap-1.5 font-mono text-xs bg-[#090e17] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
          <span className="text-slate-600 font-bold">$</span>
          <span className="text-slate-400 font-bold">sys.run(</span>
          <span className="font-extrabold transition-colors duration-300 tracking-wide" style={{ color: live ? '#60a5fa' : 'var(--text-lo)' }}>
            "{action}"
          </span>
          <span className="text-slate-400 font-bold">)</span>
          {live && <span className="anim-blink text-[#3dd68c] ml-1.5 shadow-[0_0_8px_#3dd68c]">▌</span>}
        </div>
      </div>
    </div>
  );
};
