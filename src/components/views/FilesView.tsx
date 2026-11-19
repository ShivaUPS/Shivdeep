import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext.tsx';
import { EcosystemFile, FileCategory } from '../../types/ecosystem.ts';
import {
  FolderSync,
  Search,
  LayoutGrid,
  List,
  Upload,
  Send,
  Download,
  Trash2,
  Star,
  FileText,
  FileCode,
  FileArchive,
  FileImage,
  FileAudio,
  FileVideo,
  CheckCircle,
  HardDrive,
  Info,
  X,
  Share2
} from 'lucide-react';

interface FilesViewProps {
  onOpenSendModal: (fileId: string) => void;
}

export const FilesView: React.FC<FilesViewProps> = ({ onOpenSendModal }) => {
  const {
    files,
    devices,
    activeDeviceId,
    uploadFile,
    deleteFile,
    toggleStarFile,
    downloadFile
  } = useEcosystem();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FileCategory>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (category: EcosystemFile['category']) => {
    switch (category) {
      case 'code':
        return <FileCode className="w-5 h-5 text-amber-400" />;
      case 'image':
        return <FileImage className="w-5 h-5 text-emerald-400" />;
      case 'archive':
        return <FileArchive className="w-5 h-5 text-purple-400" />;
      case 'audio':
        return <FileAudio className="w-5 h-5 text-pink-400" />;
      case 'video':
        return <FileVideo className="w-5 h-5 text-cyan-400" />;
      default:
        return <FileText className="w-5 h-5 text-blue-400" />;
    }
  };

  const categories: { id: FileCategory; label: string }[] = [
    { id: 'all', label: 'All Files' },
    { id: 'document', label: 'Documents' },
    { id: 'code', label: 'Code & Config' },
    { id: 'image', label: 'Images' },
    { id: 'audio', label: 'Audio' },
    { id: 'archive', label: 'Archives' }
  ];

  // Filtering
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.extension.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    const matchesDevice = deviceFilter === 'all' || file.primaryDeviceId === deviceFilter || file.syncedDeviceIds.includes(deviceFilter);
    return matchesSearch && matchesCategory && matchesDevice;
  });

  const selectedFile = files.find(f => f.id === selectedFileId) || null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const f = e.target.files[0];
      const ext = f.name.split('.').pop()?.toLowerCase() || 'dat';
      let cat: EcosystemFile['category'] = 'document';
      if (['jpg', 'jpeg', 'png', 'svg', 'raw', 'webp'].includes(ext)) cat = 'image';
      else if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) cat = 'audio';
      else if (['mp4', 'mov', 'mkv'].includes(ext)) cat = 'video';
      else if (['zip', 'tar', 'gz', 'bin'].includes(ext)) cat = 'archive';
      else if (['js', 'ts', 'tsx', 'jsx', 'json', 'py', 'rs'].includes(ext)) cat = 'code';

      uploadFile({
        name: f.name,
        sizeBytes: f.size || 2500000,
        category: cat,
        extension: ext
      });
      e.target.value = '';
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto flex-1">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Files & Storage Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access, replicate, and transmit documents across all registered nodes
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white cursor-pointer transition-all shadow-md shadow-cyan-600/20">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New File</span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search files by name, type, extension..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Device origin filter dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={deviceFilter}
            onChange={e => setDeviceFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="all">All Terminal Nodes</option>
            {devices.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Grid / List toggle */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Segmented Controls */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Content Area: Split View when file is selected */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className={`${selectedFile ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
          {filteredFiles.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <FolderSync className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No matching files found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Adjust your search or category filter, or upload a new file from your current device.
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredFiles.map(file => {
                const originDev = devices.find(d => d.id === file.primaryDeviceId);
                const isSelected = selectedFileId === file.id;

                return (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 group ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/5'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0">
                          {getFileIcon(file.category)}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              toggleStarFile(file.id);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              file.isStarred ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                            }`}
                            title="Star file"
                          >
                            <Star className={`w-3.5 h-3.5 ${file.isStarred ? 'fill-amber-400' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {formatBytes(file.sizeBytes)} · {file.modifiedAt}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate max-w-[120px]">
                        {originDev?.name || 'Device'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onOpenSendModal(file.id);
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
              {filteredFiles.map(file => {
                const originDev = devices.find(d => d.id === file.primaryDeviceId);
                const isSelected = selectedFileId === file.id;

                return (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    className={`p-3.5 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-500/10' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                        {getFileIcon(file.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-slate-200 truncate">{file.name}</p>
                          {file.isStarred && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Origin: {originDev?.name || 'Unknown'} · {formatBytes(file.sizeBytes)} · {file.modifiedAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-emerald-400 font-mono hidden sm:inline">
                        Synced ({file.syncedDeviceIds.length})
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onOpenSendModal(file.id);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* File Details Drawer */}
        {selectedFile && (
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 sticky top-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-800 text-cyan-400">
                  {getFileIcon(selectedFile.category)}
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                    File Inspector
                  </h3>
                  <p className="text-[11px] text-slate-400">{selectedFile.extension.toUpperCase()} Asset</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFileId(null)}
                className="p-1 rounded-lg text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-white break-all">{selectedFile.name}</p>
              <p className="text-xs text-slate-400 font-mono">{formatBytes(selectedFile.sizeBytes)}</p>
            </div>

            {/* Metadata attributes */}
            <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
              <div className="flex justify-between text-slate-400">
                <span>Primary Terminal:</span>
                <span className="text-slate-200 font-medium">
                  {devices.find(d => d.id === selectedFile.primaryDeviceId)?.name || 'Device'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Modified Date:</span>
                <span className="text-slate-200">{selectedFile.modifiedAt}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Replication Nodes:</span>
                <span className="text-emerald-400 font-mono">
                  {selectedFile.syncedDeviceIds.length} / {devices.length} Devices
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Hash Fingerprint:</span>
                <span className="text-slate-500 font-mono text-[10px]">SHA256:d8a9...4f1e</span>
              </div>
            </div>

            {/* Synced Terminals list */}
            <div className="space-y-2 border-t border-slate-800/80 pt-3">
              <p className="text-xs font-medium text-slate-300">Terminal Parity Status</p>
              <div className="space-y-1.5">
                {devices.map(dev => {
                  const isSynced = selectedFile.syncedDeviceIds.includes(dev.id);
                  return (
                    <div
                      key={dev.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 text-xs"
                    >
                      <span className="text-slate-300 truncate">{dev.name}</span>
                      {isSynced ? (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                          <CheckCircle className="w-3 h-3" /> Synced
                        </span>
                      ) : (
                        <button
                          onClick={() => onOpenSendModal(selectedFile.id)}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono"
                        >
                          Sync Now
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 border-t border-slate-800/80 pt-4">
              <button
                onClick={() => onOpenSendModal(selectedFile.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to Another Device</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => downloadFile(selectedFile.id)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => {
                    deleteFile(selectedFile.id);
                    setSelectedFileId(null);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-900 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
