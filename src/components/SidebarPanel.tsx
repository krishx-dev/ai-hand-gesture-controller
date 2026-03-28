import React from 'react';
import { X, Sliders, Hand, Eye, Zap } from 'lucide-react';
import { GESTURE_CATALOG } from '../utils/gestureEngine';
import type { Settings } from '../types';

interface Props {
  settings:        Settings;
  onSettingsChange:(key: keyof Settings, val: number | boolean) => void;
  enabledGestures: Record<string, boolean>;
  onToggleGesture: (id: string) => void;
  onClose:         () => void;
}

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({
  icon, title, children,
}) => (
  <div className="mb-7">
    <div className="flex items-center gap-3 mb-4 pb-2 border-b border-black/80 shadow-[0_1px_0_rgba(255,255,255,0.05)]">
      <span className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">{icon}</span>
      <span className="text-[11px] font-black text-[#cbd5e1] tracking-widest uppercase">
        {title}
      </span>
    </div>
    <div className="flex flex-col gap-5">
      {children}
    </div>
  </div>
);

const SliderRow: React.FC<{
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; onChange: (v: number) => void;
}> = ({ label, value, min, max, step, format, onChange }) => (
  <div className="inset-well p-3 bg-[#0f172a] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] border-t border-black/80">
    <div className="flex justify-between items-center mb-2.5">
      <span className="text-xs font-bold text-white tracking-wide">{label}</span>
      <span className="text-[11px] font-mono font-black text-blue-400 drop-shadow-sm bg-blue-900/30 px-2 py-0.5 rounded shadow-inner">{format(value)}</span>
    </div>
    <input
      type="range" className="slider drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
      min={min} max={max} step={step} value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
    />
  </div>
);

const ToggleRow: React.FC<{
  label: string; sub?: string; value: boolean; onChange: (v: boolean) => void;
}> = ({ label, sub, value, onChange }) => (
  <div className="inset-well p-3 flex items-center justify-between gap-3 group bg-[#0f172a] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] border-t border-black/80 cursor-pointer" onClick={() => onChange(!value)}>
    <div>
      <div className="text-xs font-bold text-white tracking-wide leading-tight group-hover:text-blue-300 transition-colors">{label}</div>
      {sub && <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest leading-snug mt-1.5 max-w-[180px]">{sub}</div>}
    </div>
    <button className={`tog shrink-0 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6),_0_1px_1px_rgba(255,255,255,0.2)] ${value ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); onChange(!value); }} />
  </div>
);

export const SidebarPanel: React.FC<Props> = ({
  settings, onSettingsChange, enabledGestures, onToggleGesture, onClose,
}) => {
  const gestures = GESTURE_CATALOG.filter(g => g.id !== 'none');

  return (
    <div className="glass-panel h-full shadow-[-20px_0_50px_rgba(0,0,0,0.8)] border-l border-white/20 flex flex-col">
      {/* Sidebar header */}
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900/60 border-t border-black/80 border-b border-white/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all bg-blue-500/10 border-blue-500/30">
            <Sliders size={20} className="text-blue-400 drop-shadow-sm" />
          </div>
          <span className="text-[15px] font-extrabold text-white tracking-wide drop-shadow-md">System Config</span>
        </div>
        <button onClick={onClose} className="btn-skeuo w-10 h-10 !p-0 group flex items-center justify-center">
          <X size={20} className="text-slate-300 drop-shadow-sm group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="panel-body overflow-y-auto custom-scrollbar flex-1 pt-0">

        <Section icon={<Eye size={16} />} title="Detection Tuners">
          <SliderRow
            label="Neural Sensitivity" value={settings.sensitivity}
            min={0.3} max={1.0} step={0.05}
            format={v => `${Math.round(v*100)}%`}
            onChange={v => onSettingsChange('sensitivity', v)}
          />
          <SliderRow
            label="Safety Confidence" value={settings.minConfidence}
            min={0.3} max={0.95} step={0.05}
            format={v => `${Math.round(v*100)}%`}
            onChange={v => onSettingsChange('minConfidence', v)}
          />
          <SliderRow
            label="Trigger Cooldown" value={settings.gestureDelay}
            min={200} max={1500} step={100}
            format={v => `${v}ms`}
            onChange={v => onSettingsChange('gestureDelay', v)}
          />
          <SliderRow
            label="Engine FPS Limit" value={settings.fpsLimit}
            min={10} max={60} step={5}
            format={v => `${v} fps`}
            onChange={v => onSettingsChange('fpsLimit', v)}
          />
        </Section>

        <Section icon={<Eye size={16} />} title="Visuals">
          <ToggleRow
            label="Show Landmarks" sub="Skeletal wireframe tracking"
            value={settings.showLandmarks}
            onChange={v => onSettingsChange('showLandmarks', v)}
          />
          <ToggleRow
            label="Bounding Box" sub="Focus region tracker target"
            value={settings.showBoundingBox}
            onChange={v => onSettingsChange('showBoundingBox', v)}
          />
        </Section>

        <Section icon={<Zap size={16} />} title="Execute Actions">
          <ToggleRow
            label="Auto Execution" sub="Fire commands on confident read"
            value={settings.autoAction}
            onChange={v => onSettingsChange('autoAction', v)}
          />
          <ToggleRow
            label="Sound Feedback" sub="Audio chime on exec"
            value={settings.soundFeedback}
            onChange={v => onSettingsChange('soundFeedback', v)}
          />
        </Section>

        <Section icon={<Hand size={16} />} title="Gesture Hooks">
          <div className="flex flex-col gap-3">
            {gestures.map(g => (
              <div key={g.id} className="inset-well flex items-center justify-between p-3.5 transition-all duration-300 group cursor-pointer" style={{
                background: enabledGestures[g.id] ? `linear-gradient(135deg, ${g.color}30, rgba(0,0,0,0.6))` : 'rgba(0,0,0,0.6)',
                border: `1px solid ${enabledGestures[g.id] ? `${g.color}50` : 'rgba(0,0,0,0.8)'}`,
                boxShadow: enabledGestures[g.id] ? `inset 0 2px 10px ${g.color}20, 0 1px 0 rgba(255,255,255,0.05)` : 'inset 0 2px 10px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05)',
              }} onClick={() => onToggleGesture(g.id)}>
                <div className="flex items-center gap-4">
                  <span className="text-2xl drop-shadow-md transition-transform group-hover:scale-110" style={{ filter: enabledGestures[g.id] ? `drop-shadow(0 0 10px ${g.color}80)` : 'grayscale(100%)' }}>{g.emoji}</span>
                  <div>
                    <div className="text-sm font-black leading-tight tracking-wide" style={{ color: enabledGestures[g.id] ? '#fff' : 'var(--text-lo)' }}>
                      {g.name}
                    </div>
                    <div className="text-[10px] uppercase font-mono font-bold leading-tight tracking-widest mt-1" style={{ color: enabledGestures[g.id] ? g.color : 'var(--text-lo)' }}>
                      {g.action}
                    </div>
                  </div>
                </div>
                <button
                  className={`tog shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),_0_1px_1px_rgba(255,255,255,0.2)] ${enabledGestures[g.id] ? 'on' : ''}`}
                  onClick={(e) => { e.stopPropagation(); onToggleGesture(g.id); }}
                  style={{ 
                    background: enabledGestures[g.id] ? g.color : undefined,
                    borderColor: enabledGestures[g.id] ? 'transparent' : 'rgba(0,0,0,0.8)'
                  }}
                />
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-black/80 flex items-center justify-between shrink-0 bg-[#090e17] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
        <span className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-widest">
          MediaPipe Engine
        </span>
        <span className="text-[10px] font-mono text-blue-500 uppercase font-bold tracking-widest drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">
          v2.5 · ACTIVE
        </span>
      </div>
    </div>
  );
};
