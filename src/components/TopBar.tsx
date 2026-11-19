import React from 'react';
import { useEcosystem } from '../context/EcosystemContext.tsx';
import {
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
  Plus,
  BatteryCharging,
  BatteryMedium,
  Wifi,
  Radio
} from 'lucide-react';
import { DeviceType } from '../types/ecosystem.ts';

interface TopBarProps {
  onOpenPairModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenPairModal }) => {
  const {
    devices,
    activeDeviceId,
    setActiveDeviceId,
    triggerGlobalSync,
    syncJobs
  } = useEcosystem();

  const isAnySyncing = syncJobs.some(j => j.status === 'syncing');

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'laptop':
        return <Laptop className="w-3.5 h-3.5" />;
      case 'phone':
        return <Smartphone className="w-3.5 h-3.5" />;
      case 'tablet':
        return <Tablet className="w-3.5 h-3.5" />;
      case 'desktop':
        return <Monitor className="w-3.5 h-3.5" />;
      default:
        return <Radio className="w-3.5 h-3.5" />;
    }
  };

  return (
    <header className="h-16 px-6 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between gap-8 shrink-0 z-30">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Wifi className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white font-sans whitespace-nowrap">
            Wi-Connect
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Unified Ecosystem
          </span>
        </div>
      </div>

      {/* Zone 2: Active Device Switcher Bar */}
      <div className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-950/60 border border-slate-800 rounded-xl overflow-x-auto max-w-2xl">
        <button
          onClick={() => setActiveDeviceId('all')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            activeDeviceId === 'all'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>All Devices ({devices.length})</span>
        </button>

        {devices.map(dev => {
          const isSelected = activeDeviceId === dev.id;
          return (
            <button
              key={dev.id}
              onClick={() => setActiveDeviceId(dev.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <span className={isSelected ? 'text-cyan-400' : 'text-slate-500'}>
                {getDeviceIcon(dev.type)}
              </span>
              <span className="truncate max-w-[120px]">{dev.name}</span>

              {/* Battery indicator */}
              <div className="flex items-center gap-1 text-[10px] text-slate-400 tabular-nums">
                {dev.isCharging ? (
                  <BatteryCharging className="w-3 h-3 text-emerald-400" />
                ) : (
                  <BatteryMedium className={`w-3 h-3 ${dev.batteryLevel < 20 ? 'text-amber-400' : 'text-slate-400'}`} />
                )}
                <span>{dev.batteryLevel}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={triggerGlobalSync}
          disabled={isAnySyncing}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            isAnySyncing
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 cursor-not-allowed'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 shadow-sm'
          }`}
          title="Synchronize all files, messages and clipboard items across paired hardware"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnySyncing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">{isAnySyncing ? 'Syncing Fleet...' : 'Sync Fleet'}</span>
        </button>

        <button
          onClick={onOpenPairModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-600/20 transition-all whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Pair Device</span>
        </button>
      </div>
    </header>
  );
};
