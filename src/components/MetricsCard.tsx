import React from 'react';
import { Activity, Cpu, Clock, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { SystemMetrics } from '../types';

interface Props {
  metrics:         SystemMetrics;
  fpsHistory:      { t: string; fps: number; lat: number }[];
  cameraConnected: boolean;
}

const ChartTip = ({ active, payload }: { active?: boolean; payload?: { value: number; name: string }[] }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-[11px] font-mono backdrop-blur-xl bg-[#0f1219]/90 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
      {payload.map((p, i) => (
        <div key={i} className="font-semibold" style={{ color: i === 0 ? '#60a5fa' : '#3dd68c' }}>
          {p.name}: <strong className="text-white drop-shadow-sm">{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

interface RowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  color: string;
  pct: number;
  offline?: boolean;
}
const Row: React.FC<RowProps> = ({ icon, label, value, unit, color, pct, offline }) => (
  <div className="inset-well p-3 flex flex-col justify-center group hover:bg-white/5 transition-all">
    <div className="flex items-center justify-between mb-2.5">
      <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
        <span style={{ color: offline ? 'var(--text-lo)' : color }}>{icon}</span>
        <span className="text-label">{label}</span>
      </div>
      <span className="text-sm font-mono font-black drop-shadow-sm transition-colors" style={{ color: offline ? 'var(--text-lo)' : color }}>
        {offline ? '--' : `${value}${unit}`}
      </span>
    </div>
    <div className="prog-track h-2 bg-[#090e17] border border-white/5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] rounded-full overflow-hidden">
      <div className="prog-fill shadow-[0_0_10px_currentColor] transition-all duration-300 rounded-full" style={{ width: offline ? '0%' : `${pct}%`, background: offline ? 'transparent' : `linear-gradient(90deg, ${color}60, ${color})`, color }} />
    </div>
  </div>
);

export const MetricsCard: React.FC<Props> = ({ metrics, fpsHistory, cameraConnected }) => {
  const fpsP = Math.min(100, (metrics.fps / 60) * 100);
  const cpuP = metrics.cpuUsage;
  const latP = Math.min(100, 100 - (metrics.latency / 100) * 100);
  const accP = metrics.accuracy * 100;

  return (
    <div className="glass-panel anim-fadeup flex-1 flex flex-col h-full" style={{ animationDelay: '0.35s' }}>
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900/60 border-t border-black/80 border-b border-white/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all" style={{
            background: cameraConnected ? 'rgba(61,214,140,0.15)' : 'rgba(0,0,0,0.3)',
            borderColor: cameraConnected ? 'rgba(61,214,140,0.3)' : 'rgba(0,0,0,0.8)',
            boxShadow: cameraConnected ? 'inset 0 2px 10px rgba(61,214,140,0.2), 0 0 10px rgba(61,214,140,0.1)' : 'inset 0 2px 8px rgba(0,0,0,0.8)',
          }}>
            <Activity size={20} color={cameraConnected ? '#3dd68c' : 'var(--text-lo)'} className={cameraConnected ? 'drop-shadow-sm' : ''} />
          </div>
          <div>
            <div className="text-[15px] font-extrabold text-white leading-tight tracking-wide drop-shadow-md">Performance</div>
            <div className="text-[11px] font-mono font-bold leading-tight tracking-widest text-[#64748b] uppercase mt-0.5">
              {cameraConnected ? 'Live metrics' : 'Standby'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full border-t border-white/20 border-b border-black/50 shadow-inner">
          <span className="dot pulse w-2 h-2 rounded-full" style={{ background: cameraConnected ? '#3dd68c' : 'var(--text-lo)', display: cameraConnected ? 'block' : 'none', boxShadow: '0 0 8px #3dd68c' }} />
          <span className="text-[11px] font-mono font-black tracking-widest" style={{ color: cameraConnected ? '#3dd68c' : 'var(--text-lo)' }}>
            {cameraConnected ? 'RUNNING' : 'OFFLINE'}
          </span>
        </div>
      </div>

      <div className="panel-body gap-5 flex-1">
        {/* FPS chart */}
        <div className="inset-well p-4 flex flex-col h-28 relative overflow-hidden transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label">Live Throughput</span>
            <span className="text-xs font-mono font-black tracking-wider transition-colors duration-300" style={{ color: cameraConnected ? '#60a5fa' : 'var(--text-lo)' }}>
              {cameraConnected ? `${metrics.fps} fps · ${metrics.latency}ms` : '---'}
            </span>
          </div>
          <div className="flex-1 mt-1 relative">
            {cameraConnected && fpsHistory.length > 2 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fpsHistory} margin={{ top:0, right:0, bottom:0, left:0 }}>
                  <defs>
                    <linearGradient id="gFps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="gLat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3dd68c" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3dd68c" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" hide />
                  <YAxis hide domain={[0, 65]} />
                  <Tooltip content={<ChartTip />} cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="fps" name="FPS"
                    stroke="#60a5fa" strokeWidth={3} fill="url(#gFps)"
                    dot={false} activeDot={{ r: 5, fill: '#60a5fa', stroke: '#fff', strokeWidth: 2 }} 
                    style={{ filter: `drop-shadow(0 4px 10px rgba(96,165,250,0.5))` }} />
                  <Area type="monotone" dataKey="lat" name="Latency"
                    stroke="#3dd68c" strokeWidth={3} fill="url(#gLat)"
                    dot={false} activeDot={{ r: 5, fill: '#3dd68c', stroke: '#fff', strokeWidth: 2 }} 
                    style={{ filter: `drop-shadow(0 4px 10px rgba(61,214,140,0.5))` }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#090e17] rounded-xl border border-white/5 shadow-inner">
                <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#64748b]">
                  {cameraConnected ? 'COLLECTING…' : 'NO DATA'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 2×2 metric grid */}
        <div className="grid grid-cols-2 gap-3 mt-auto mb-2">
          <Row icon={<Activity size={14}/>} label="FPS"      value={metrics.fps}           unit=" fps" color="#60a5fa"   pct={fpsP} offline={!cameraConnected} />
          <Row icon={<Cpu      size={14}/>} label="CPU"      value={metrics.cpuUsage}       unit="%"    color="#a78bfa"  pct={cpuP} offline={!cameraConnected} />
          <Row icon={<Clock    size={14}/>} label="Latency"  value={metrics.latency}        unit="ms"   color="#3dd68c"   pct={latP} offline={!cameraConnected} />
          <Row icon={<Target   size={14}/>} label="Accuracy" value={Math.round(accP)}     unit="%"    color="#f5a623"   pct={accP} offline={!cameraConnected} />
        </div>

        {/* Total Display */}
        <div className="inset-well p-3 flex flex-col justify-center border-t border-black/80 mx-1">
          <div className="flex items-center justify-between">
            <span className="text-label">Processed Actions</span>
            <span className="text-[20px] font-black font-mono tracking-wide drop-shadow-md transition-colors duration-300" style={{ color: cameraConnected ? '#f1f5f9' : 'var(--text-lo)' }}>
              {cameraConnected ? metrics.totalGestures.toLocaleString() : '---'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
