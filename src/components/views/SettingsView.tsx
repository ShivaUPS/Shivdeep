import React from 'react';
import { useEcosystem } from '../../context/EcosystemContext.tsx';
import {
  Sliders,
  Wifi,
  Volume2,
  VolumeX,
  Battery,
  Cloud,
  Clipboard,
  Radio,
  RotateCcw,
  ShieldCheck,
  Zap,
  CheckCircle2
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetAllData } = useEcosystem();

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto flex-1">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
          Ecosystem Synchronization Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure background replication rules, bandwidth limits, cellular data policies, and telemetry alerts
        </p>
      </div>

      {/* Main Settings Sections */}
      <div className="space-y-6">
        {/* Core Mesh Sync Policies */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            Replication & Mesh Network Rules
          </h2>

          <div className="divide-y divide-slate-800/80 space-y-4">
            {/* Auto-Sync Toggle */}
            <div className="pt-4 first:pt-0 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-200">Automatic Ecosystem Parity</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Continuously synchronize new files and messages in the background across paired devices.
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ autoSyncEnabled: !settings.autoSyncEnabled })}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  settings.autoSyncEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.autoSyncEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Wi-Fi Only */}
            <div className="pt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" /> Restrict Large Sync to Wi-Fi
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pause file transfers over 50MB when using metered cellular (5G) connections.
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ syncOnWifiOnly: !settings.syncOnWifiOnly })}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  settings.syncOnWifiOnly ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.syncOnWifiOnly ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Universal Clipboard Sync */}
            <div className="pt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Clipboard className="w-3.5 h-3.5 text-emerald-400" /> Universal Clipboard Broadcast
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Automatically synchronize copied text and links across all paired hardware terminals.
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ clipboardSyncEnabled: !settings.clipboardSyncEnabled })}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  settings.clipboardSyncEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.clipboardSyncEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sound Effects */}
            <div className="pt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  {settings.soundEffectsEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  Acoustic Audio Chimes
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Play subtle Web Audio chimes on completed transfers, incoming messages, and locator pings.
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ soundEffectsEnabled: !settings.soundEffectsEnabled })}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  settings.soundEffectsEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.soundEffectsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Bandwidth & Battery Limits */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Performance & Power Optimization
          </h2>

          <div className="space-y-6">
            {/* Bandwidth Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Max Transfer Bandwidth Ceiling</span>
                <span className="font-mono text-cyan-400 font-bold tabular-nums">
                  {settings.maxBandwidthMbps} Mbps
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={settings.maxBandwidthMbps}
                onChange={e => updateSettings({ maxBandwidthMbps: Number(e.target.value) })}
                className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>50 Mbps (Low Power)</span>
                <span>500 Mbps</span>
                <span>1000 Mbps (Full Gigabit)</span>
              </div>
            </div>

            {/* Battery Threshold Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Battery className="w-3.5 h-3.5 text-amber-400" /> Low-Battery Sync Throttle
                </span>
                <span className="font-mono text-amber-400 font-bold tabular-nums">
                  Under {settings.batterySaverThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={settings.batterySaverThreshold}
                onChange={e => updateSettings({ batterySaverThreshold: Number(e.target.value) })}
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Pauses background heavy file syncing on devices when remaining battery drops below this threshold.
              </p>
            </div>

            {/* Cloud Backup Cadence */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-blue-400" /> Remote Cloud Snapshot Cadence
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['realtime', 'hourly', 'daily', 'manual'] as const).map(cadence => (
                  <button
                    key={cadence}
                    type="button"
                    onClick={() => updateSettings({ cloudBackupCadence: cadence })}
                    className={`py-2 px-3 rounded-xl text-xs font-medium capitalize transition-all ${
                      settings.cloudBackupCadence === cadence
                        ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cadence}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance & Reset */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-200">Reset Demo Ecosystem State</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Restore initial seed terminals, sample files, message logs, and clear browser localStorage.
            </p>
          </div>

          <button
            onClick={resetAllData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-900 transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
};
