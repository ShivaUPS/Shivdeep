import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext.tsx';
import { EcosystemFile, Device } from '../../types/ecosystem.ts';
import { X, Send, Laptop, Smartphone, Tablet, Monitor, CheckCircle, Wifi, ShieldCheck } from 'lucide-react';

interface SendFileModalProps {
  file: EcosystemFile | null;
  onClose: () => void;
}

export const SendFileModal: React.FC<SendFileModalProps> = ({ file, onClose }) => {
  const { devices, sendFileToDevice } = useEcosystem();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [protocol, setProtocol] = useState<'wifi_direct' | 'mesh' | 'cloud'>('wifi_direct');

  if (!file) return null;

  const eligibleDevices = devices.filter(d => d.id !== file.primaryDeviceId);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getDeviceIcon = (dev: Device) => {
    switch (dev.type) {
      case 'laptop':
        return <Laptop className="w-4 h-4" />;
      case 'phone':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Laptop className="w-4 h-4" />;
    }
  };

  const handleSend = () => {
    if (!selectedDeviceId) return;
    sendFileToDevice(file.id, selectedDeviceId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Send File Across Ecosystem</h3>
              <p className="text-xs text-slate-400">Direct peer-to-peer transmission</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected File Card */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{file.name}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {formatBytes(file.sizeBytes)} · Origin: {devices.find(d => d.id === file.primaryDeviceId)?.name || 'Local'}
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase shrink-0">
            {file.extension}
          </span>
        </div>

        {/* Destination Device Selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Choose Destination Terminal</label>
          <div className="space-y-2">
            {eligibleDevices.map(dev => {
              const isSelected = selectedDeviceId === dev.id;
              const isAlreadySynced = file.syncedDeviceIds.includes(dev.id);

              return (
                <button
                  key={dev.id}
                  onClick={() => setSelectedDeviceId(dev.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-cyan-500/50 bg-cyan-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                      {getDeviceIcon(dev)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-slate-200">{dev.name}</p>
                        {isAlreadySynced && (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> In Parity
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {dev.os} · {dev.connectionType} · {dev.storageTotalGb - dev.storageUsedGb}GB Free
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-cyan-400 bg-cyan-500' : 'border-slate-700'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Transfer Protocol Options */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Transmission Protocol</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setProtocol('wifi_direct')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                protocol === 'wifi_direct'
                  ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex justify-center mb-1">
                <Wifi className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium">Wi-Fi Direct</p>
              <p className="text-[10px] text-slate-500 font-mono">~450 Mbps</p>
            </button>

            <button
              onClick={() => setProtocol('mesh')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                protocol === 'mesh'
                  ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex justify-center mb-1">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium">Mesh Relay</p>
              <p className="text-[10px] text-slate-500 font-mono">End-to-End</p>
            </button>

            <button
              onClick={() => setProtocol('cloud')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                protocol === 'cloud'
                  ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex justify-center mb-1">
                <Send className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium">Cloud Vault</p>
              <p className="text-[10px] text-slate-500 font-mono">Sync on Wake</p>
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!selectedDeviceId}
            className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
              selectedDeviceId
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Transmit File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
