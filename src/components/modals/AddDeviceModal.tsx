import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext.tsx';
import { Device, DeviceType, ConnectionType } from '../../types/ecosystem.ts';
import { X, QrCode, KeyRound, Radio, Laptop, Smartphone, Tablet, Monitor, Watch, Check, Sparkles } from 'lucide-react';

interface AddDeviceModalProps {
  onClose: () => void;
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ onClose }) => {
  const { addDevice } = useEcosystem();

  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState<DeviceType>('tablet');
  const [osName, setOsName] = useState('Android 15 / ChromeOS');
  const [connectionType, setConnectionType] = useState<ConnectionType>('Wi-Fi 6E');
  const [storageGb, setStorageGb] = useState('256');
  const [pairingMethod, setPairingMethod] = useState<'scan' | 'pin' | 'manual'>('scan');
  const [isSuccess, setIsSuccess] = useState(false);

  const presetDevices = [
    { name: 'Pixel Watch 3', type: 'wearable' as DeviceType, os: 'Wear OS 5.0', storage: 32 },
    { name: 'Steam Deck OLED', type: 'laptop' as DeviceType, os: 'SteamOS 3.5 (Arch Linux)', storage: 512 },
    { name: 'ThinkPad X1 Carbon', type: 'laptop' as DeviceType, os: 'Fedora 40 Workstation', storage: 1024 },
    { name: 'Living Room Media Hub', type: 'desktop' as DeviceType, os: 'Ubuntu Server 24.04', storage: 2048 }
  ];

  const handleSelectPreset = (preset: typeof presetDevices[0]) => {
    setDeviceName(preset.name);
    setDeviceType(preset.type);
    setOsName(preset.os);
    setStorageGb(String(preset.storage));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName.trim()) return;

    const newDev: Omit<Device, 'id'> = {
      name: deviceName.trim(),
      type: deviceType,
      os: osName || 'Custom OS',
      model: `${deviceName} Terminal`,
      batteryLevel: Math.floor(Math.random() * 40) + 60,
      isCharging: false,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 80) + 110}`,
      connectionType,
      signalStrength: 'strong',
      storageUsedGb: Math.floor(Number(storageGb) * 0.25),
      storageTotalGb: Number(storageGb) || 256,
      isOnline: true,
      isLocked: false,
      lastSyncTime: 'Just now',
      location: 'Local Wi-Fi Mesh'
    };

    addDevice(newDev);
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Pair New Hardware Terminal</h3>
              <p className="text-xs text-slate-400">Expand your unified Wi-Connect mesh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-white">Device Successfully Paired!</h4>
            <p className="text-xs text-slate-400">Establishing initial handshake and cryptographic key exchange...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Pairing Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPairingMethod('scan')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all ${
                  pairingMethod === 'scan'
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Connect</span>
              </button>
              <button
                type="button"
                onClick={() => setPairingMethod('pin')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all ${
                  pairingMethod === 'pin'
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>6-Digit PIN</span>
              </button>
              <button
                type="button"
                onClick={() => setPairingMethod('manual')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all ${
                  pairingMethod === 'manual'
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Quick Preset</span>
              </button>
            </div>

            {pairingMethod === 'scan' && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
                <div className="w-24 h-24 bg-white p-2 rounded-lg flex items-center justify-center shrink-0">
                  <div className="w-full h-full border-2 border-dashed border-slate-900 flex items-center justify-center">
                    <QrCode className="w-14 h-14 text-slate-900" />
                  </div>
                </div>
                <div className="space-y-1 text-left">
                  <p className="text-xs font-semibold text-slate-200">Scan via Wi-Connect Mobile App</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Point your camera or companion app to securely authorize TLS mesh pairing without entering credentials.
                  </p>
                </div>
              </div>
            )}

            {pairingMethod === 'pin' && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-400">Enter this code on your second device:</p>
                <div className="text-2xl font-mono font-bold tracking-widest text-cyan-400">
                  894 - 102
                </div>
                <p className="text-[10px] text-slate-500">Expires in 04:59</p>
              </div>
            )}

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> Quick Add Existing Fleet Devices
              </label>
              <div className="grid grid-cols-2 gap-2">
                {presetDevices.map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="p-2 text-left rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 hover:border-slate-700 transition-all text-xs"
                  >
                    <p className="font-semibold text-slate-200 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{p.os}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Inputs */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Device Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pixel Watch 3 or ThinkPad P1"
                  value={deviceName}
                  onChange={e => setDeviceName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Hardware Form</label>
                  <select
                    value={deviceType}
                    onChange={e => setDeviceType(e.target.value as DeviceType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="phone">Phone / Mobile</option>
                    <option value="tablet">Tablet / Slate</option>
                    <option value="laptop">Laptop / Ultrabook</option>
                    <option value="desktop">Workstation / Rig</option>
                    <option value="wearable">Wearable / Watch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Storage Capacity (GB)</label>
                  <input
                    type="number"
                    min="16"
                    max="8192"
                    value={storageGb}
                    onChange={e => setStorageGb(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!deviceName.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                  deviceName.trim()
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>Authorize & Pair</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
