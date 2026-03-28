import React from 'react';
import { Target, TrendingUp } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import type { GestureType } from '../types';
import { GESTURE_CATALOG } from '../utils/gestureEngine';

interface Props {
  confidence:        number;
  gesture:           GestureType;
  confidenceHistory: number[];
  cameraConnected:   boolean;
}

export const ConfidenceCard: React.FC<Props> = ({
  confidence, gesture, confidenceHistory, cameraConnected,
}) => {
  const pct    = Math.round(confidence * 100);
  const avg    = confidenceHistory.length > 0
    ? Math.round(confidenceHistory.reduce((a, b) => a + b, 0) / confidenceHistory.length * 100)
    : 0;
  const peak   = confidenceHistory.length > 0
    ? Math.round(Math.max(...confidenceHistory) * 100)
    : 0;

  const gc =
    !cameraConnected ? '#64748b' :
    pct >= 85 ? '#3dd68c' :
    pct >= 68 ? '#60a5fa' :
    pct >= 50 ? '#f5a623' :
    '#e05c5c';

  const quality =
    pct >= 85 ? 'Excellent' :
    pct >= 68 ? 'Good'      :
    pct >= 50 ? 'Fair'      :
    pct > 0   ? 'Low'       : '—';

  const radialData = [{ value: cameraConnected ? pct : 0, fill: gc }];
  const waveBars   = [4,6,8,5,7,9,7,6,8,10,9,8,7,9,10,9,8,7,6,8];

  return (
    <div className="glass-panel anim-fadeup flex-1 flex flex-col h-full" style={{ animationDelay: '0.25s' }}>
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900/60 border-t border-black/80 border-b border-white/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all" style={{
            background: `${gc}15`,
            borderColor: `${gc}30`,
            boxShadow: cameraConnected ? `inset 0 2px 10px ${gc}20, 0 0 10px ${gc}10` : 'inset 0 2px 8px rgba(0,0,0,0.8)',
          }}>
            <Target size={20} color={gc} className={cameraConnected ? 'drop-shadow-sm' : ''} />
          </div>
          <div>
            <div className="text-[15px] font-extrabold text-white leading-tight tracking-wide drop-shadow-md">
              Confidence
            </div>
            <div className="text-[11px] font-mono font-bold leading-tight tracking-widest text-[#64748b] uppercase mt-0.5">
              {cameraConnected ? 'Real-time score' : 'Standby'}
            </div>
          </div>
        </div>
        
        {cameraConnected && avg > 0 && (
          <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full border-t border-white/20 border-b border-black/50 shadow-inner">
            <TrendingUp size={14} color={gc} />
            <span className="text-xs font-mono font-bold tracking-wide" style={{ color: gc }}>
              avg {avg}%
            </span>
          </div>
        )}
      </div>

      <div className="panel-body gap-5 flex-1">
        
        {/* Radial gauge (Deep Inset) */}
        <div className="inset-well relative h-[155px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 rounded-full" style={{
            background: cameraConnected ? `radial-gradient(circle, ${gc}15 0%, transparent 65%)` : 'transparent',
            filter: 'blur(12px)',
          }} />
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%" cy="58%"
              innerRadius="72%" outerRadius="105%"
              startAngle={180} endAngle={0}
              data={radialData} barSize={14}
            >
              <PolarAngleAxis type="number" domain={[0,100]} angleAxisId={0} tick={false} />
              <RadialBar
                background={{ fill: 'rgba(0,0,0,0.4)', stroke: 'rgba(255,255,255,0.02)' }}
                dataKey="value"
                angleAxisId={0}
                cornerRadius={8}
                style={{ filter: `drop-shadow(0 0 8px ${gc}80)` }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          
          {/* Centered Number */}
          <div className="absolute bottom-6 flex flex-col items-center gap-1">
            <span className="text-[38px] font-black font-mono tracking-tighter drop-shadow-lg leading-none transition-colors duration-300" style={{ color: gc }}>
              {cameraConnected ? pct : '--'}
              {cameraConnected && <span className="text-sm font-bold opacity-70 ml-0.5">%</span>}
            </span>
            <span className="text-label mt-1">{cameraConnected ? quality : 'OFFLINE'}</span>
          </div>
        </div>

        {/* Wave bars */}
        <div className="inset-well flex items-end justify-center gap-1 p-3 h-14 relative overflow-hidden bg-[#090e17]">
          {waveBars.map((h, i) => {
            const frac = cameraConnected ? (h / 10) * (pct / 100) : 0.05;
            return (
              <div
                key={i}
                className={cameraConnected && pct > 0 ? 'anim-wave rounded-full' : 'rounded-full'}
                style={{
                  flex:1,
                  height: `${Math.max(frac * 100, 8)}%`,
                  maxHeight:'90%',
                  background: cameraConnected ? `linear-gradient(180deg, ${gc}, ${gc}40)` : 'rgba(255,255,255,0.05)',
                  opacity: cameraConnected ? 1 : 0.5,
                  animationDelay:`${i*0.055}s`,
                  transition:'height 0.35s ease',
                  boxShadow: cameraConnected ? `0 0 6px ${gc}60` : 'none',
                }}
              />
            );
          })}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:'Current', value: cameraConnected ? `${pct}%`   : '--', color: gc              },
            { label:'Avg',     value: cameraConnected ? `${avg}%`   : '--', color:'#60a5fa'        },
            { label:'Peak',    value: cameraConnected ? `${peak}%`  : '--', color:'#3dd68c'        },
          ].map(({ label, value, color }) => (
            <div key={label} className="inset-well p-2.5 flex flex-col items-center justify-center text-center backdrop-blur-md">
              <div className="text-sm font-black font-mono tracking-wider drop-shadow-sm transition-colors" style={{ color: cameraConnected ? color : 'var(--text-lo)' }}>
                {value}
              </div>
              <div className="text-label mt-1.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Per-gesture mini bars */}
        <div className="flex flex-col gap-3 mt-auto pt-2">
          {GESTURE_CATALOG.filter(g => g.id !== 'none').slice(0, 4).map(g => {
            const active = cameraConnected && g.id === gesture;
            const w      = active ? pct : 0;
            return (
              <div key={g.id} className="flex items-center gap-3 inset-well !p-2">
                <span className="text-base flex-shrink-0 w-7 text-center drop-shadow-md" style={{ opacity: cameraConnected ? 1 : 0.4 }}>{g.emoji}</span>
                <div className="prog-track h-2 flex-1 bg-black/60 border border-white/5 shadow-inner rounded-full overflow-hidden">
                  <div className="prog-fill shadow-[0_0_10px_currentColor] transition-all duration-300 rounded-full" style={{ width:`${w}%`, background: active ? `linear-gradient(90deg, ${gc}60, ${gc})` : 'transparent', color: gc }} />
                </div>
                <span className="text-[11px] font-mono font-bold w-10 text-right flex-shrink-0 bg-black/30 px-1 py-0.5 rounded" style={{
                  color: active ? gc : 'var(--text-lo)',
                }}>
                  {active ? `${w}%` : '--'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
