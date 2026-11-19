import React, { useState } from 'react';
import { EcosystemProvider, useEcosystem } from './context/EcosystemContext.tsx';
import { TopBar } from './components/TopBar.tsx';
import { NavigationRail } from './components/NavigationRail.tsx';
import { OverviewView } from './components/views/OverviewView.tsx';
import { FilesView } from './components/views/FilesView.tsx';
import { MessagesView } from './components/views/MessagesView.tsx';
import { ClipboardView } from './components/views/ClipboardView.tsx';
import { DevicesView } from './components/views/DevicesView.tsx';
import { SettingsView } from './components/views/SettingsView.tsx';
import { SendFileModal } from './components/modals/SendFileModal.tsx';
import { AddDeviceModal } from './components/modals/AddDeviceModal.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { AuthGate } from './components/AuthGate.tsx';

const AppContent: React.FC = () => {
  const { activeTab, files } = useEcosystem();
  const [sendFileId, setSendFileId] = useState<string | null>(null);
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);

  const fileToSend = files.find(f => f.id === sendFileId) || null;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 3-Zone Top Navigation Contract */}
      <TopBar onOpenPairModal={() => setIsAddDeviceOpen(true)} />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <NavigationRail />

        {/* Dynamic Viewport Container */}
        <main className="flex-1 overflow-y-auto bg-slate-950/20">
          {activeTab === 'overview' && (
            <OverviewView
              onOpenSendModal={id => setSendFileId(id)}
              onOpenAddDevice={() => setIsAddDeviceOpen(true)}
            />
          )}
          {activeTab === 'files' && (
            <FilesView onOpenSendModal={id => setSendFileId(id)} />
          )}
          {activeTab === 'messages' && <MessagesView />}
          {activeTab === 'clipboard' && <ClipboardView />}
          {activeTab === 'devices' && (
            <DevicesView onOpenAddDevice={() => setIsAddDeviceOpen(true)} />
          )}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Modals & Portals */}
      <SendFileModal
        file={fileToSend}
        onClose={() => setSendFileId(null)}
      />

      {isAddDeviceOpen && (
        <AddDeviceModal onClose={() => setIsAddDeviceOpen(false)} />
      )}

      {/* Notification Toast Stack */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <EcosystemProvider>
        <AuthGate>
          <AppContent />
        </AuthGate>
      </EcosystemProvider>
    </ErrorBoundary>
  );
}
