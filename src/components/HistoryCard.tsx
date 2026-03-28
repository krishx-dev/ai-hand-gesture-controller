import React, { useState } from 'react';
import { History, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { GestureHistoryEntry, GestureUsageData } from '../types';

interface Props {
  history:   GestureHistoryEntry[];
  usageData: GestureUsageData[];
}

const ago = (d: Date) => {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 5)  return 'just now';
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return d.toLocaleTimeString('en-US', { hour12: false });
};

export const HistoryCard: React.FC<Props> = ({ history, usageData }) => {
  const [tab, setTab] = useState<'log'|'chart'>('log');

  return (
    <div className="glass-panel anim-fadeup flex-1 flex flex-col h-[400px]" style={{ animationDelay:'0.3s' }}>
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900/60 border-t border-black/80 border-b border-white/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all" style={{
            background: 'rgba(245,166,35,0.15)', borderColor: 'rgba(245,166,35,0.3)',
            boxShadow: 'inset 0 2px 10px rgba(245,166,35,0.2), 0 0 10px rgba(245,166,35,0.1)',
          }}>
            <History size={20} color="#f5a623" className="drop-shadow-sm" />
          </div>
          <div>
            <div className="text-[15px] font-extrabold text-white leading-tight tracking-wide drop-shadow-md">Gesture Log</div>
            <div className="text-[11px] font-mono font-bold leading-tight tracking-widest text-[#64748b] uppercase mt-0.5">
              {history.length} events recorded
            </div>
          </div>
        </div>

        {/* Tactile Tab switcher */}
        <div className="flex gap-2 p-1.5 bg-[#090e17] rounded-xl shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] border border-white/10 backdrop-blur-md">
          {([ 
            { id:'log',   Icon: History,   label:'Log'   },
            { id:'chart', Icon: BarChart2, label:'Chart' },
          ] as const).map(({ id, Icon, label }) => (
            <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-300 ${
              tab === id 
                ? 'bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] text-white shadow-[inset_0_1px_1px_rgba(147,197,253,0.5),_0_2px_8px_rgba(37,99,235,0.4)] border border-[#1e3a8a]' 
                : 'bg-transparent text-[#64748b] hover:text-white hover:bg-white/5 border border-transparent'
            }`}>
              <Icon size={14} className={tab === id ? 'drop-shadow-sm text-blue-100' : ''} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="panel-body overflow-hidden flex-1 relative pt-0">
        {tab === 'log' ? (
          /* ── Thick Inset Log view ── */
          <div className="inset-well overflow-y-auto w-full h-full p-3 flex flex-col gap-3 custom-scrollbar">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 opacity-70">
                <span className="text-5xl grayscale drop-shadow-md">📋</span>
                <span className="text-xs font-mono font-bold text-[#64748b] tracking-widest uppercase mt-2">
                  No gestures recorded yet
                </span>
              </div>
            ) : (
              [...history].reverse().map(e => (
                <div key={e.id} className="flex items-center gap-5 px-5 py-4 rounded-xl bg-gradient-to-b from-white/10 to-white/5 border-t border-white/20 border-b border-black/40 shadow-sm hover:translate-y-[-1px] hover:shadow-md transition-all backdrop-blur-md group cursor-default">
                  <span className="text-[28px] shrink-0 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">{e.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-sm font-black tracking-wide drop-shadow-sm filter brightness-110" style={{ color: e.color }}>{e.name}</span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] font-mono font-bold" style={{
                        background: `${e.color}25`, color: e.color, border: `1px solid ${e.color}50`,
                      }}>
                        {Math.round(e.confidence * 100)}%
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-300 truncate block font-black uppercase tracking-widest opacity-80">
                      {e.action}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold tracking-widest text-[#64748b] shrink-0 uppercase whitespace-nowrap">
                    {ago(e.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : (
          /* ── Chart view ── */
          <div className="inset-well h-full w-full p-4 flex flex-col">
            {usageData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 opacity-70">
                <span className="text-5xl grayscale drop-shadow-md">📊</span>
                <span className="text-xs font-mono font-bold text-[#64748b] tracking-widest uppercase mt-2">No data yet</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4 pl-2">
                  <span className="text-label">Gesture Frequency Matrix</span>
                </div>
                <div className="flex-1 min-h-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageData} margin={{ top:5, right:5, bottom:0, left:-20 }} barSize={24}>
                      <defs>
                        {usageData.map((e, index) => (
                           <linearGradient key={`grad-${index}`} id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                             <stop offset="0%" stopColor={e.color} stopOpacity={1} />
                             <stop offset="100%" stopColor={e.color} stopOpacity={0.4} />
                           </linearGradient>
                        ))}
                      </defs>
                      <XAxis dataKey="emoji" tick={{ fill:'var(--text-med)', fontSize:18 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill:'var(--text-lo)', fontSize:11, fontFamily:'monospace', fontWeight:'bold' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill:'rgba(255,255,255,0.05)' }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload as GestureUsageData;
                          return (
                            <div className="px-4 py-3 rounded-2xl text-[12px] font-mono backdrop-blur-xl bg-[#0f1219]/95 shadow-[0_12px_40px_rgba(0,0,0,0.8),_inset_0_1px_1px_rgba(255,255,255,0.1)] border-t border-white/20" style={{ borderLeft:`2px solid ${d.color}` }}>
                              <p className="font-extrabold drop-shadow-sm mb-1 text-sm flex items-center gap-2" style={{ color: d.color }}>
                                <span className="text-lg">{d.emoji}</span> <span>{d.name}</span>
                              </p>
                              <p className="text-slate-400 font-bold tracking-widest mt-2 uppercase text-[10px]">Total Triggers: <span className="text-white text-base ml-1">{d.count}</span></p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="count" radius={[8,8,0,0]}>
                        {usageData.map((e, i) => (
                          <Cell key={i} fill={`url(#grad-${i})`} style={{ filter: `drop-shadow(0 0 10px ${e.color}60)` }} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
