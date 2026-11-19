import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext.tsx';
import {
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  FolderSync,
  MessageSquare,
  ClipboardList,
  HardDrive,
  Wifi,
  Send,
  Volume2,
  Copy,
  Check,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Lock,
  Unlock,
  Radio,
  FileText
} from 'lucide-react';
import { DeviceType } from '../../types/ecosystem.ts';

interface OverviewViewProps {
  onOpenSendModal: (fileId: string) => void;
  onOpenAddDevice: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onOpenSendModal, onOpenAddDevice }) => {
  const {
    devices,
    activeDevice,
    activeDeviceId,
    files,
    messageThreads,
    clipboardItems,
    syncJobs,
    setActiveTab,
    pingDevice,
    toggleDeviceLock,
    triggerGlobalSync,
    copyToClipboard,
    addClipboardItem,
    uploadFile
  } = useEcosystem();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [quickSnippet, setQuickSnippet] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const totalStorageUsed = devices.reduce((sum, d) => sum + d.storageUsedGb, 0);
  const totalStorageMax = devices.reduce((sum, d) => sum + d.storageTotalGb, 0);
  const totalUnreadMessages = messageThreads.reduce((sum, th) => sum + th.unreadCount, 0);

  const handleCopySnippet = async (item: typeof clipboardItems[0]) => {
    const success = await copyToClipboard(item);
    if (success) {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1600);
    }
  };

  const handleAddQuickSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSnippet.trim()) return;
    addClipboardItem(quickSnippet.trim());
    setQuickSnippet('');
  };

  const handleQuickDropUpload = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const f = e.dataTransfer.files[0];
      uploadFile({
        name: f.name,
        sizeBytes: f.size || 1024000,
        category: 'document',
        extension: f.name.split('.').pop() || 'dat'
      });
    }
  };

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'laptop':
        return <Laptop className="w-4 h-4" />;
      case 'phone':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Radio className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & KPI Stat Strip */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              Ecosystem Command Hub
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Active terminal context: <span className="text-cyan-400 font-semibold">{activeDevice?.name || 'All Fleet Devices'}</span> · Real-time parity link active
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerGlobalSync}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Broadcast Parity Check</span>
            </button>
            <button
              onClick={onOpenAddDevice}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Terminal</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveTab('devices')}
            className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Fleet Terminals</span>
              <Smartphone className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-white">
                {devices.filter(d => d.isOnline).length}
              </span>
              <span className="text-xs text-slate-500 font-mono">/ {devices.length} Online</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">100% mesh latency nominal</p>
          </div>

          <div
            onClick={() => setActiveTab('files')}
            className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Shared Files</span>
              <FolderSync className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-white">
                {files.length}
              </span>
              <span className="text-xs text-slate-500 font-mono">Files in Sync</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Replicating across peer nodes</p>
          </div>

          <div
            onClick={() => setActiveTab('messages')}
            className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Active Messages</span>
              <MessageSquare className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-white">
                {totalUnreadMessages}
              </span>
              <span className="text-xs text-slate-500 font-mono">Unread Pings</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{messageThreads.length} Synced channels</p>
          </div>

          <div
            onClick={() => setActiveTab('clipboard')}
            className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Universal Clipboard</span>
              <ClipboardList className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-white">
                {clipboardItems.length}
              </span>
              <span className="text-xs text-slate-500 font-mono">Live Snippets</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Cross-device copy buffer</p>
          </div>
        </div>
      </div>

      {/* Active Device Spotlight & Quick Transfer Strip */}
      {activeDevice && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                {getDeviceIcon(activeDevice.type)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">{activeDevice.name}</h2>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    {activeDevice.ipAddress}
                  </span>
                  {activeDevice.isLocked && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {activeDevice.os} · {activeDevice.model} · Last active {activeDevice.lastSyncTime}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => pingDevice(activeDevice.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeDevice.isPinging
                    ? 'bg-cyan-500 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
                title="Send audio sonar ping"
              >
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>{activeDevice.isPinging ? 'Pinging Terminal...' : 'Ping Device'}</span>
              </button>

              <button
                onClick={() => toggleDeviceLock(activeDevice.id)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                title={activeDevice.isLocked ? 'Unlock device' : 'Lock device remotely'}
              >
                {activeDevice.isLocked ? (
                  <>
                    <Unlock className="w-4 h-4 text-emerald-400" />
                    <span>Unlock</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>Remote Lock</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Device Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Storage Utilization</span>
                <span className="font-mono tabular-nums text-slate-200">
                  {activeDevice.storageUsedGb} GB / {activeDevice.storageTotalGb} GB
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  style={{
                    width: `${Math.round((activeDevice.storageUsedGb / activeDevice.storageTotalGb) * 100)}%`
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs text-slate-400 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-cyan-400" /> Link Protocol
              </span>
              <span className="text-xs font-semibold text-slate-200 font-mono">
                {activeDevice.connectionType}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs text-slate-400 flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" /> Mesh Location
              </span>
              <span className="text-xs font-medium text-slate-200 truncate max-w-[150px]">
                {activeDevice.location}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Split Grid: Left = Activity & Live Transfers; Right = Universal Clipboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Quick Dropzone & Recent Ecosystem Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick File Transfer Dropzone */}
          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleQuickDropUpload}
            className={`p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center space-y-3 ${
              isDragging
                ? 'border-cyan-400 bg-cyan-500/10'
                : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
            }`}
          >
            <div className="p-3 rounded-full bg-slate-800 text-cyan-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Quick File Broadcast & Replicate
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Drag and drop files here to immediately sync to {activeDevice?.name || 'ecosystem'}
              </p>
            </div>
            <label className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors">
              Browse Local Files
              <input
                type="file"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files.length > 0) {
                    const f = e.target.files[0];
                    uploadFile({
                      name: f.name,
                      sizeBytes: f.size,
                      category: 'document',
                      extension: f.name.split('.').pop() || 'dat'
                    });
                  }
                }}
              />
            </label>
          </div>

          {/* Active / Recent Sync Jobs Pipeline */}
          {syncJobs.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Transfer Pipeline
                </h3>
                <span className="text-[11px] text-cyan-400 font-mono">
                  {syncJobs.filter(j => j.status === 'syncing').length} active
                </span>
              </div>
              <div className="space-y-2.5">
                {syncJobs.slice(0, 3).map(job => (
                  <div
                    key={job.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 truncate">{job.title}</span>
                      <span className="font-mono text-cyan-400 tabular-nums">
                        {job.status === 'completed' ? 'Synced (100%)' : `${job.progress}% · ${job.speedMbps} Mbps`}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          job.status === 'completed'
                            ? 'bg-emerald-400'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                        }`}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Synced Files preview */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Fleet File Catalog Preview
              </h3>
              <button
                onClick={() => setActiveTab('files')}
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>View All ({files.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-800/80">
              {files.slice(0, 4).map(file => {
                const originDev = devices.find(d => d.id === file.primaryDeviceId);
                return (
                  <div
                    key={file.id}
                    className="py-3 flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-slate-800 text-slate-300 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {originDev?.name || 'Device'} · Synced to {file.syncedDeviceIds.length} terminals
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onOpenSendModal(file.id)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
                      >
                        Send to...
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Universal Shared Clipboard Stream */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Universal Clipboard
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('clipboard')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Manage
              </button>
            </div>

            {/* Quick Add Snippet Form */}
            <form onSubmit={handleAddQuickSnippet} className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type or paste to share across devices..."
                  value={quickSnippet}
                  onChange={e => setQuickSnippet(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!quickSnippet.trim()}
                  className="absolute right-1.5 top-1.5 p-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition-colors"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>

            {/* Clipboard Items List */}
            <div className="space-y-2.5">
              {clipboardItems.slice(0, 5).map(item => {
                const originDev = devices.find(d => d.id === item.originDeviceId);
                const isCopied = copiedId === item.id;

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="font-semibold text-slate-400">{originDev?.name || 'Device'}</span>
                        <span>·</span>
                        <span>{item.createdAt}</span>
                      </div>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {item.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 font-mono break-all line-clamp-2">
                      {item.text}
                    </p>

                    <div className="flex items-center justify-end pt-1">
                      <button
                        onClick={() => handleCopySnippet(item)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                          isCopied
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
