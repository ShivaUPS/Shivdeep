import React from 'react';
import { useEcosystem } from '../context/EcosystemContext.tsx';
import {
  LayoutDashboard,
  FolderSync,
  MessageSquare,
  ClipboardList,
  Smartphone,
  Sliders,
  BatteryCharging,
  BatteryMedium,
  Wifi,
  Volume2,
  HardDrive,
  LogOut
} from 'lucide-react';
import { ActiveTab } from '../types/ecosystem.ts';

export const NavigationRail: React.FC = () => {
  const {
    user,
    signOutUser,
    activeTab,
    setActiveTab,
    files,
    messageThreads,
    clipboardItems,
    devices,
    activeDevice,
    pingDevice
  } = useEcosystem();

  const totalUnreadMessages = messageThreads.reduce((sum, th) => sum + th.unreadCount, 0);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'overview',
      label: 'Overview Hub',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'files',
      label: 'Files & Storage',
      icon: <FolderSync className="w-4 h-4" />,
      badge: files.length
    },
    {
      id: 'messages',
      label: 'Messages & Intercom',
      icon: <MessageSquare className="w-4 h-4" />,
      badge: totalUnreadMessages > 0 ? totalUnreadMessages : undefined
    },
    {
      id: 'clipboard',
      label: 'Universal Clipboard',
      icon: <ClipboardList className="w-4 h-4" />,
      badge: clipboardItems.length
    },
    {
      id: 'devices',
      label: 'Device Fleet',
      icon: <Smartphone className="w-4 h-4" />,
      badge: `${devices.filter(d => d.isOnline).length}/${devices.length}`
    },
    {
      id: 'settings',
      label: 'Sync Settings',
      icon: <Sliders className="w-4 h-4" />
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-900/40 backdrop-blur-md flex flex-col justify-between shrink-0 select-none">
      <div className="p-4 space-y-6">
        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Ecosystem Modules
          </p>
          <nav className="space-y-1">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : typeof item.badge === 'number' && item.badge > 0 && item.id === 'messages'
                          ? 'bg-blue-500 text-white font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Active Device Quick Diagnostic Card */}
      {activeDevice && (
        <div className="p-4 m-3 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <p className="text-xs font-semibold text-slate-200 truncate">
                {activeDevice.name}
              </p>
            </div>
            <button
              onClick={() => pingDevice(activeDevice.id)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors shrink-0"
              title="Ping this device"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 truncate">
              {activeDevice.isCharging ? (
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <BatteryMedium className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              <span className="font-mono tabular-nums">{activeDevice.batteryLevel}%</span>
            </div>

            <div className="flex items-center gap-1.5 truncate">
              <Wifi className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{activeDevice.connectionType}</span>
            </div>
          </div>

          {/* Storage bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-slate-500" />
                Storage
              </span>
              <span className="font-mono tabular-nums">
                {activeDevice.storageUsedGb}GB / {activeDevice.storageTotalGb}GB
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((activeDevice.storageUsedGb / activeDevice.storageTotalGb) * 100)
                  )}%`
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Signed-in Account Footer */}
      {user && (
        <div className="px-3 pb-3">
          <div className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Account avatar'}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-lg object-cover border border-slate-700 shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {user.displayName || 'Account'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={signOutUser}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-colors shrink-0"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
