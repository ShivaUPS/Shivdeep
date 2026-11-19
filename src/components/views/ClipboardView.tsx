import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext.tsx';
import { ClipboardItem } from '../../types/ecosystem.ts';
import {
  ClipboardList,
  Copy,
  Check,
  Pin,
  Trash2,
  Plus,
  Search,
  ExternalLink,
  Code,
  FileJson,
  Type,
  Laptop,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';

export const ClipboardView: React.FC = () => {
  const {
    clipboardItems,
    devices,
    copyToClipboard,
    addClipboardItem,
    togglePinClipboard,
    deleteClipboardItem,
    activeDevice
  } = useEcosystem();

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newText, setNewText] = useState('');
  const [selectedType, setSelectedType] = useState<ClipboardItem['type']>('text');

  const filteredItems = clipboardItems
    .filter(item =>
      item.text.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const handleCopy = async (item: ClipboardItem) => {
    const success = await copyToClipboard(item);
    if (success) {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1600);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    addClipboardItem(newText, selectedType);
    setNewText('');
  };

  const getTypeIcon = (type: ClipboardItem['type']) => {
    switch (type) {
      case 'code':
        return <Code className="w-4 h-4 text-amber-400" />;
      case 'link':
        return <ExternalLink className="w-4 h-4 text-cyan-400" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-emerald-400" />;
      default:
        return <Type className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Universal Shared Clipboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Copy text, commands, tokens, or links on one device and paste them instantly on any other
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono">
          Sync Buffer: <span className="text-cyan-400 font-bold">{clipboardItems.length} active items</span>
        </div>
      </div>

      {/* Input Creator Card */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Publish New Shared Snippet
        </h3>

        <form onSubmit={handleAdd} className="space-y-3">
          <textarea
            rows={2}
            placeholder={`Enter text, code snippet, URL, or JSON to share across all fleet devices from ${activeDevice?.name || 'terminal'}...`}
            value={newText}
            onChange={e => setNewText(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {(['text', 'code', 'link', 'json'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedType(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase transition-colors ${
                    selectedType === t
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!newText.trim()}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                newText.trim()
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-600/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Broadcast to Clipboard</span>
            </button>
          </div>
        </form>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search clipboard snippets, commands, or URLs..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {/* Snippet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map(item => {
          const originDev = devices.find(d => d.id === item.originDeviceId);
          const isCopied = copiedId === item.id;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                item.isPinned
                  ? 'bg-slate-900/80 border-cyan-500/30 shadow-md shadow-cyan-500/5'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                      {getTypeIcon(item.type)}
                    </span>
                    <span className="font-semibold text-slate-300">
                      {originDev?.name || 'Local Terminal'}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-500 text-[11px] font-mono">{item.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePinClipboard(item.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        item.isPinned ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={item.isPinned ? 'Unpin snippet' : 'Pin snippet to top'}
                    >
                      <Pin className={`w-3.5 h-3.5 ${item.isPinned ? 'fill-cyan-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => deleteClipboardItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete snippet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 max-h-36 overflow-y-auto">
                  <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap break-all leading-relaxed">
                    {item.text}
                  </pre>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {item.type}
                </span>

                <button
                  onClick={() => handleCopy(item)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isCopied
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-sm'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Copy to System</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
