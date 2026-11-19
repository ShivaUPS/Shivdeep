import React from 'react';
import { useEcosystem } from '../../context/EcosystemContext.tsx';
import { Device, DeviceType } from '../../types/ecosystem.ts';
import {
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  Radio,
  BatteryCharging,
  BatteryMedium,
  Wifi,
  HardDrive,
  Volume2,
  Lock,
  Unlock,
  Trash2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Signal
} from 'lucide-react';

interface DevicesViewProps {
  onOpenAddDevice: () => void;
}

export const DevicesView: React.FC<DevicesViewProps> = ({ onOpenAddDevice }) => {
  const {
    devices,
    activeDeviceId,
    setActiveDeviceId,
    pingDevice,
    toggleDeviceLock,
    removeDevice,
    triggerGlobalSync
  } = useEcosystem();

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'laptop':
        return <Laptop className="w-5 h-5 text-indigo-400" />;
      case 'phone':
        return <Smartphone className="w-5 h-5 text-cyan-400" />;
      case 'tablet':
        return <Tablet className="w-5 h-5 text-blue-400" />;
      case 'desktop':
        return <Monitor className="w-5 h-5 text-purple-400" />;
      default:
        return <Radio className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Device Fleet & Telemetry Diagnostics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor hardware battery, network connection quality, storage, and remote security controls
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerGlobalSync}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Poll Fleet Diagnostics</span>
          </button>
          <button
            onClick={onOpenAddDevice}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pair Terminal</span>
          </button>
        </div>
      </div>

      {/* Grid of Device Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {devices.map(dev => {
          const isActive = activeDeviceId === dev.id;
          const storagePercent = Math.round((dev.storageUsedGb / dev.storageTotalGb) * 100);

          return (
            <div
              key={dev.id}
              className={`p-6 rounded-2xl border transition-all space-y-5 relative overflow-hidden ${
                dev.isPinging
                  ? 'border-cyan-400 bg-cyan-950/20 ring-2 ring-cyan-500/50 shadow-2xl shadow-cyan-500/20'
                  : isActive
                  ? 'border-cyan-500/40 bg-slate-900/80 shadow-lg shadow-cyan-500/5'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              {/* Radar ping ripple animation */}
              {dev.isPinging && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border border-cyan-400/40 animate-ping" />
                  <div className="w-72 h-72 rounded-full border border-cyan-400/20 animate-ping delay-150" />
                </div>
              )}

              {/* Card Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
                    {getDeviceIcon(dev.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{dev.name}</h3>
                      {isActive && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Active Context
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{dev.os} · {dev.model}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setActiveDeviceId(dev.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {isActive ? 'Current' : 'Select'}
                  </button>
                  {devices.length > 1 && (
                    <button
                      onClick={() => removeDevice(dev.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Unpair Device"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Telemetry Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                {/* Battery */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    {dev.isCharging ? (
                      <BatteryCharging className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <BatteryMedium className={`w-4 h-4 ${dev.batteryLevel < 20 ? 'text-amber-400' : 'text-slate-400'}`} />
                    )}
                    Battery
                  </span>
                  <span className="font-mono tabular-nums text-slate-200">
                    {dev.batteryLevel}% {dev.isCharging && '(Charging)'}
                  </span>
                </div>

                {/* Connection */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Wifi className="w-4 h-4 text-cyan-400" />
                    Protocol
                  </span>
                  <span className="font-mono text-slate-200 truncate">{dev.connectionType}</span>
                </div>

                {/* IP Address */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-slate-500" />
                    IP Address
                  </span>
                  <span className="font-mono text-slate-300">{dev.ipAddress}</span>
                </div>

                {/* Location */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Signal className="w-4 h-4 text-emerald-400" />
                    Mesh Spot
                  </span>
                  <span className="text-slate-300 truncate max-w-[110px]">{dev.location}</span>
                </div>
              </div>

              {/* Storage Meter */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                    Local SSD Storage
                  </span>
                  <span className="font-mono tabular-nums text-slate-300">
                    {dev.storageUsedGb} GB of {dev.storageTotalGb} GB used ({storagePercent}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    style={{ width: `${storagePercent}%` }}
                  />
                </div>
              </div>

              {/* Hardware Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-500 font-mono">
                  Synced: {dev.lastSyncTime}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => pingDevice(dev.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      dev.isPinging
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{dev.isPinging ? 'Pinging...' : 'Ping Locator'}</span>
                  </button>

                  <button
                    onClick={() => toggleDeviceLock(dev.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    {dev.isLocked ? (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Unlock</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Remote Lock</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
