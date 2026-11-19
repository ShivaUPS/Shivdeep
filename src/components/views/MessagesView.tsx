import React, { useState, useRef, useEffect } from 'react';
import { useEcosystem } from '../../context/EcosystemContext.tsx';
import {
  MessageSquare,
  Send,
  Radio,
  Lock,
  Smartphone,
  Laptop,
  CheckCheck,
  Check,
  Sparkles,
  PhoneCall,
  Volume2
} from 'lucide-react';
import { DeviceType } from '../../types/ecosystem.ts';

export const MessagesView: React.FC = () => {
  const {
    messageThreads,
    activeThreadId,
    setActiveThreadId,
    sendMessage,
    markThreadRead,
    devices,
    activeDevice,
    pingDevice
  } = useEcosystem();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = messageThreads.find(th => th.id === activeThreadId) || messageThreads[0];

  useEffect(() => {
    if (activeThread) {
      markThreadRead(activeThread.id);
    }
  }, [activeThreadId, markThreadRead, activeThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeThread) return;
    sendMessage(activeThread.id, inputMessage);
    setInputMessage('');
  };

  const sendQuickPing = (text: string) => {
    if (!activeThread) return;
    sendMessage(activeThread.id, text);
  };

  const getDeviceIcon = (devId: string) => {
    const dev = devices.find(d => d.id === devId);
    if (!dev) return <Laptop className="w-3 h-3 text-slate-400" />;
    switch (dev.type as DeviceType) {
      case 'phone':
        return <Smartphone className="w-3 h-3 text-cyan-400" />;
      case 'tablet':
        return <Smartphone className="w-3 h-3 text-blue-400" />;
      default:
        return <Laptop className="w-3 h-3 text-indigo-400" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex-1 h-[calc(100vh-4rem)] flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Cross-Device Communication & Intercom
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Seamlessly relay messages, SMS, and terminal intercom broadcasts across all devices
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Sending as:</span>
          <span className="text-xs font-semibold text-cyan-400 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            {activeDevice?.name || 'Primary Node'}
          </span>
        </div>
      </div>

      {/* Split Pane Chat Interface */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-2xl">
        {/* Left Column: Threads List */}
        <div className="border-r border-slate-800/80 bg-slate-950/40 flex flex-col">
          <div className="p-4 border-b border-slate-800/80">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Communication Channels
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {messageThreads.map(th => {
              const isSelected = activeThreadId === th.id;
              const lastMsg = th.messages[th.messages.length - 1];

              return (
                <button
                  key={th.id}
                  onClick={() => setActiveThreadId(th.id)}
                  className={`w-full p-4 text-left transition-colors flex items-start gap-3 ${
                    isSelected
                      ? 'bg-cyan-500/10 border-l-2 border-cyan-400'
                      : 'hover:bg-slate-900/60'
                  }`}
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-semibold text-xs shrink-0">
                      {th.channel === 'intercom' ? (
                        <Radio className="w-4 h-4 text-cyan-400" />
                      ) : th.channel === 'encrypted' ? (
                        <Lock className="w-4 h-4 text-amber-400" />
                      ) : (
                        th.contactName.charAt(0)
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {th.contactName}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {th.lastUpdated}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {lastMsg?.text || 'No messages yet'}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] uppercase font-mono text-slate-500">
                        {th.channel}
                      </span>

                      {th.unreadCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950">
                          {th.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Conversation */}
        <div className="md:col-span-2 flex flex-col h-full bg-slate-900/40">
          {activeThread ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-semibold text-xs shrink-0">
                    {activeThread.channel === 'intercom' ? (
                      <Radio className="w-4 h-4 text-cyan-400" />
                    ) : (
                      activeThread.contactName.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold text-white">{activeThread.contactName}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase font-mono">
                        {activeThread.channel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {activeThread.contactRole || activeThread.contactHandle}
                    </p>
                  </div>
                </div>

                {activeThread.channel === 'intercom' && (
                  <button
                    onClick={() => {
                      if (activeDevice) pingDevice(activeDevice.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Sonar Ping</span>
                  </button>
                )}
              </div>

              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {activeThread.messages.map(msg => {
                  const isUser = msg.sender === 'user';
                  const originDev = devices.find(d => d.id === msg.deviceOriginId);

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed space-y-1.5 ${
                          isUser
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-sm shadow-md shadow-cyan-600/10'
                            : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        <div
                          className={`flex items-center justify-between gap-3 text-[10px] pt-1 ${
                            isUser ? 'text-cyan-200/80' : 'text-slate-400'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            {getDeviceIcon(msg.deviceOriginId)}
                            <span>{originDev?.name || 'Local Terminal'}</span>
                          </span>

                          <div className="flex items-center gap-1 font-mono">
                            <span>{msg.timestamp}</span>
                            {isUser && (
                              <CheckCheck className="w-3 h-3 text-cyan-200 inline" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Intercom Pings Strip */}
              <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto">
                <span className="text-[10px] text-slate-500 font-semibold uppercase shrink-0">
                  Quick Pings:
                </span>
                <button
                  type="button"
                  onClick={() => sendQuickPing('Status report: Battery & mesh latency request.')}
                  className="px-2.5 py-1 rounded-md text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition-colors"
                >
                  ⚡ Battery & Latency Ping
                </button>
                <button
                  type="button"
                  onClick={() => sendQuickPing('File transfer ready. Check Wi-Connect downloads.')}
                  className="px-2.5 py-1 rounded-md text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition-colors"
                >
                  📁 Transfer Ready
                </button>
                <button
                  type="button"
                  onClick={() => sendQuickPing('Replicating latest code tokens to all nodes.')}
                  className="px-2.5 py-1 rounded-md text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition-colors"
                >
                  🔄 Token Parity Check
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSend} className="p-4 bg-slate-950/80 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Broadcast message from ${activeDevice?.name || 'Terminal'}...`}
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className={`p-2.5 rounded-xl transition-all ${
                      inputMessage.trim()
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500">
              Select a communication thread to begin
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
