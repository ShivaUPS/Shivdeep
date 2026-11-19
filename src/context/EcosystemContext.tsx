import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { auth, db, googleProvider, OperationType, handleFirestoreError } from '../firebase.ts';
import {
  Device,
  EcosystemFile,
  MessageThread,
  Message,
  ClipboardItem,
  SyncJob,
  SyncSettings,
  NotificationEvent,
  ActiveTab
} from '../types/ecosystem.ts';
import { sound } from '../utils/audio.ts';

// Initial Seed Devices
const INITIAL_DEVICES: Device[] = [
  {
    id: 'dev-macbook',
    name: 'MacBook Pro M3 Max',
    type: 'laptop',
    os: 'macOS Sequoia 15.2',
    model: 'Apple Silicon 16-inch',
    batteryLevel: 88,
    isCharging: true,
    ipAddress: '192.168.1.142',
    connectionType: 'Wi-Fi 6E',
    signalStrength: 'strong',
    storageUsedGb: 486,
    storageTotalGb: 1024,
    isOnline: true,
    isLocked: false,
    lastSyncTime: 'Just now',
    location: 'Home Studio — Desk'
  },
  {
    id: 'dev-galaxy',
    name: 'Galaxy S24 Ultra',
    type: 'phone',
    os: 'One UI 6.1 (Android 14)',
    model: 'Titanium Gray 512GB',
    batteryLevel: 64,
    isCharging: false,
    ipAddress: '192.168.1.189',
    connectionType: '5G Ultra',
    signalStrength: 'strong',
    storageUsedGb: 218,
    storageTotalGb: 512,
    isOnline: true,
    isLocked: false,
    lastSyncTime: '2 mins ago',
    location: 'With User'
  },
  {
    id: 'dev-ipad',
    name: 'iPad Pro 12.9',
    type: 'tablet',
    os: 'iPadOS 18.1',
    model: 'M2 Wi-Fi + Cellular',
    batteryLevel: 42,
    isCharging: false,
    ipAddress: '192.168.1.165',
    connectionType: 'Wi-Fi 6E',
    signalStrength: 'good',
    storageUsedGb: 142,
    storageTotalGb: 256,
    isOnline: true,
    isLocked: false,
    lastSyncTime: '15 mins ago',
    location: 'Living Room — Sofa'
  },
  {
    id: 'dev-linux',
    name: 'Arch Studio Workstation',
    type: 'desktop',
    os: 'Linux 6.8 (Hyprland)',
    model: 'Custom Dual-RTX 4090',
    batteryLevel: 100,
    isCharging: true,
    ipAddress: '192.168.1.100',
    connectionType: 'Gigabit LAN',
    signalStrength: 'strong',
    storageUsedGb: 2840,
    storageTotalGb: 4096,
    isOnline: true,
    isLocked: false,
    lastSyncTime: '1 hour ago',
    location: 'Office Lab'
  }
];

// Initial Seed Files
const INITIAL_FILES: EcosystemFile[] = [
  {
    id: 'file-1',
    name: 'Q4_Product_Strategy_Deck.key',
    sizeBytes: 42800000,
    category: 'document',
    extension: 'key',
    modifiedAt: 'Today, 2:45 PM',
    primaryDeviceId: 'dev-macbook',
    syncedDeviceIds: ['dev-macbook', 'dev-ipad'],
    isStarred: true,
    downloadCount: 14,
    tag: 'Roadmap'
  },
  {
    id: 'file-2',
    name: 'Design_System_Tokens_v3.json',
    sizeBytes: 185000,
    category: 'code',
    extension: 'json',
    modifiedAt: 'Today, 1:15 PM',
    primaryDeviceId: 'dev-macbook',
    syncedDeviceIds: ['dev-macbook', 'dev-linux', 'dev-galaxy'],
    isStarred: true,
    downloadCount: 42,
    tag: 'Tokens'
  },
  {
    id: 'file-3',
    name: 'DSC_0942_Studio_Portrait.raw',
    sizeBytes: 84200000,
    category: 'image',
    extension: 'raw',
    modifiedAt: 'Yesterday, 8:12 PM',
    primaryDeviceId: 'dev-galaxy',
    syncedDeviceIds: ['dev-galaxy'],
    isStarred: false,
    downloadCount: 3,
    tag: 'Media'
  },
  {
    id: 'file-4',
    name: 'Audio_Master_Podcast_Ep42.flac',
    sizeBytes: 320000000,
    category: 'audio',
    extension: 'flac',
    modifiedAt: 'Yesterday, 6:00 PM',
    primaryDeviceId: 'dev-linux',
    syncedDeviceIds: ['dev-linux', 'dev-macbook'],
    isStarred: false,
    downloadCount: 8,
    tag: 'Production'
  },
  {
    id: 'file-5',
    name: 'Annual_Tax_Statements_2025.pdf',
    sizeBytes: 4500000,
    category: 'document',
    extension: 'pdf',
    modifiedAt: '3 days ago',
    primaryDeviceId: 'dev-macbook',
    syncedDeviceIds: ['dev-macbook', 'dev-galaxy', 'dev-ipad'],
    isStarred: true,
    downloadCount: 6,
    tag: 'Finance'
  },
  {
    id: 'file-6',
    name: 'Neural_Weights_Checkpoint.bin',
    sizeBytes: 1420000000,
    category: 'archive',
    extension: 'bin',
    modifiedAt: 'Oct 24, 2026',
    primaryDeviceId: 'dev-linux',
    syncedDeviceIds: ['dev-linux'],
    isStarred: false,
    downloadCount: 2,
    tag: 'ML Models'
  },
  {
    id: 'file-7',
    name: 'Mobile_Wireframes_Spec.fig',
    sizeBytes: 68000000,
    category: 'document',
    extension: 'fig',
    modifiedAt: 'Oct 23, 2026',
    primaryDeviceId: 'dev-ipad',
    syncedDeviceIds: ['dev-ipad', 'dev-macbook'],
    isStarred: false,
    downloadCount: 19,
    tag: 'UI/UX'
  }
];

// Initial Seed Messages
const INITIAL_THREADS: MessageThread[] = [
  {
    id: 'th-intercom',
    contactName: 'Ecosystem Intercom',
    contactHandle: 'local.mesh.broadcast',
    contactRole: 'Wi-Connect Device Mesh',
    channel: 'intercom',
    unreadCount: 1,
    lastUpdated: '5 mins ago',
    isPinned: true,
    messages: [
      {
        id: 'msg-ic-1',
        threadId: 'th-intercom',
        sender: 'contact',
        text: 'Galaxy S24 Ultra connected via 5G Ultra. Local transfer bandwidth peaked at 480 Mbps.',
        timestamp: '12:30 PM',
        deviceOriginId: 'dev-galaxy',
        status: 'read'
      },
      {
        id: 'msg-ic-2',
        threadId: 'th-intercom',
        sender: 'user',
        text: 'Pinged all active terminals. Workstation background model run finished.',
        timestamp: '1:45 PM',
        deviceOriginId: 'dev-macbook',
        status: 'read'
      },
      {
        id: 'msg-ic-3',
        threadId: 'th-intercom',
        sender: 'contact',
        text: 'Sync alert: Q4 Strategy Deck was modified on MacBook Pro. Replicating diff to iPad Pro.',
        timestamp: '2:46 PM',
        deviceOriginId: 'dev-macbook',
        status: 'delivered'
      }
    ]
  },
  {
    id: 'th-alex',
    contactName: 'Elena Rostova',
    contactHandle: '+1 (555) 234-8921',
    contactRole: 'Lead Architect',
    channel: 'sms',
    unreadCount: 0,
    lastUpdated: '18 mins ago',
    isPinned: true,
    messages: [
      {
        id: 'msg-el-1',
        threadId: 'th-alex',
        sender: 'contact',
        text: 'Did the new token schemas deploy across the studio servers?',
        timestamp: '2:10 PM',
        deviceOriginId: 'dev-galaxy',
        status: 'read'
      },
      {
        id: 'msg-el-2',
        threadId: 'th-alex',
        sender: 'user',
        text: 'Yes! Pushed them from the MacBook just 15 minutes ago. All sync tests passed cleanly.',
        timestamp: '2:14 PM',
        deviceOriginId: 'dev-macbook',
        status: 'read'
      },
      {
        id: 'msg-el-3',
        threadId: 'th-alex',
        sender: 'contact',
        text: 'Super fast. Catch you at the 4:30 design review.',
        timestamp: '2:15 PM',
        deviceOriginId: 'dev-galaxy',
        status: 'read'
      }
    ]
  },
  {
    id: 'th-marcus',
    contactName: 'Marcus Vance',
    contactHandle: 'marcus@aerodynamics.io',
    contactRole: 'Hardware Specialist',
    channel: 'encrypted',
    unreadCount: 2,
    lastUpdated: '45 mins ago',
    isPinned: false,
    messages: [
      {
        id: 'msg-mv-1',
        threadId: 'th-marcus',
        sender: 'contact',
        text: 'Sending the telemetry log zip over the Wi-Connect mesh link.',
        timestamp: '1:10 PM',
        deviceOriginId: 'dev-linux',
        status: 'read'
      },
      {
        id: 'msg-mv-2',
        threadId: 'th-marcus',
        sender: 'contact',
        text: 'Let me know if the sensor calibration rates match your local test bench on the iPad.',
        timestamp: '1:12 PM',
        deviceOriginId: 'dev-linux',
        status: 'delivered'
      }
    ]
  }
];

// Initial Seed Clipboard
const INITIAL_CLIPBOARD: ClipboardItem[] = [
  {
    id: 'clip-1',
    text: 'ssh -i ~/.ssh/wiconnect_mesh admin@192.168.1.100 -p 2244',
    type: 'code',
    originDeviceId: 'dev-macbook',
    createdAt: '8 mins ago',
    isPinned: true
  },
  {
    id: 'clip-2',
    text: 'https://github.com/google/genai-ecosystem-architectures',
    type: 'link',
    originDeviceId: 'dev-galaxy',
    createdAt: '24 mins ago',
    isPinned: false
  },
  {
    id: 'clip-3',
    text: '{"gateway":"mesh.wiconnect.local","tls_fingerprint":"SHA256:8f2a9c31b...","mtu":9000}',
    type: 'json',
    originDeviceId: 'dev-linux',
    createdAt: '1 hour ago',
    isPinned: true
  },
  {
    id: 'clip-4',
    text: 'Delivery locker code: #8920 (Tower B - Parcel Room South)',
    type: 'text',
    originDeviceId: 'dev-galaxy',
    createdAt: '3 hours ago',
    isPinned: false
  }
];

// Initial Seed Settings
const INITIAL_SETTINGS: SyncSettings = {
  autoSyncEnabled: true,
  syncOnWifiOnly: false,
  backgroundPushEnabled: true,
  maxBandwidthMbps: 500,
  cloudBackupCadence: 'realtime',
  soundEffectsEnabled: true,
  clipboardSyncEnabled: true,
  batterySaverThreshold: 20
};

function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
  return cleaned || `id-${Date.now()}`;
}

function clampString(val: string, maxLen: number, fallback = 'Untitled'): string {
  const trimmed = val.trim();
  if (!trimmed) return fallback.slice(0, maxLen);
  return trimmed.slice(0, maxLen);
}

interface EcosystemContextType {
  user: User | null;
  authLoading: boolean;
  dataLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  devices: Device[];
  activeDeviceId: string;
  activeDevice: Device | undefined;
  files: EcosystemFile[];
  messageThreads: MessageThread[];
  activeThreadId: string;
  clipboardItems: ClipboardItem[];
  syncJobs: SyncJob[];
  settings: SyncSettings;
  notifications: NotificationEvent[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  setActiveDeviceId: (id: string) => void;
  setActiveThreadId: (id: string) => void;
  // File operations
  uploadFile: (file: { name: string; sizeBytes: number; category: EcosystemFile['category']; extension: string }) => void;
  deleteFile: (fileId: string) => void;
  toggleStarFile: (fileId: string) => void;
  sendFileToDevice: (fileId: string, targetDeviceId: string) => void;
  downloadFile: (fileId: string) => void;
  // Messaging operations
  sendMessage: (threadId: string, text: string) => void;
  markThreadRead: (threadId: string) => void;
  // Clipboard operations
  copyToClipboard: (item: ClipboardItem) => Promise<boolean>;
  addClipboardItem: (text: string, type?: ClipboardItem['type']) => void;
  togglePinClipboard: (id: string) => void;
  deleteClipboardItem: (id: string) => void;
  // Device & Telemetry operations
  pingDevice: (deviceId: string) => void;
  toggleDeviceLock: (deviceId: string) => void;
  addDevice: (newDevice: Omit<Device, 'id'>) => void;
  removeDevice: (deviceId: string) => void;
  // Sync & Settings
  triggerGlobalSync: () => void;
  updateSettings: (newSettings: Partial<SyncSettings>) => void;
  dismissNotification: (id: string) => void;
  resetAllData: () => void;
}

const EcosystemContext = createContext<EcosystemContextType | null>(null);

export const EcosystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  const [rawDevices, setRawDevices] = useState<Device[]>([]);
  const [pingingIds, setPingingIds] = useState<Set<string>>(new Set());
  const [activeDeviceId, setActiveDeviceId] = useState<string>('dev-macbook');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [files, setFiles] = useState<EcosystemFile[]>([]);
  const [threadDocs, setThreadDocs] = useState<Omit<MessageThread, 'messages'>[]>([]);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, Message[]>>({});
  const [activeThreadId, setActiveThreadId] = useState<string>('th-intercom');
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>([]);
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [settings, setSettings] = useState<SyncSettings>(INITIAL_SETTINGS);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);

  // Ref for current activeThreadId inside async callbacks
  const activeThreadIdRef = useRef(activeThreadId);
  useEffect(() => {
    activeThreadIdRef.current = activeThreadId;
  }, [activeThreadId]);

  // Merge transient pinging state into devices
  const devices: Device[] = rawDevices.map(d => ({
    ...d,
    isPinging: pingingIds.has(d.id)
  }));

  // Merge thread metadata with messages subcollection
  const messageThreads: MessageThread[] = threadDocs.map(th => ({
    ...th,
    messages: messagesByThread[th.id] || []
  }));

  // Update sound engine mute preference
  useEffect(() => {
    sound.setMuted(!settings.soundEffectsEnabled);
  }, [settings.soundEffectsEnabled]);

  // Push notification helper
  const addNotification = useCallback((title: string, message: string, type: NotificationEvent['type'] = 'info') => {
    const id = 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newNotif: NotificationEvent = {
      id,
      title,
      message,
      type,
      timestamp: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 4)]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        setRawDevices([]);
        setFiles([]);
        setThreadDocs([]);
        setMessagesByThread({});
        setClipboardItems([]);
        setSettings(INITIAL_SETTINGS);
        setSyncJobs([]);
        setDataLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Seed initial demo ecosystem for a brand-new user account
  const seedUserEcosystem = useCallback(async (uid: string) => {
    const userPath = `users/${uid}`;
    // 1. Seed Devices, Files, Threads, Clipboard in a batch
    try {
      const batch = writeBatch(db);

      for (const dev of INITIAL_DEVICES) {
        batch.set(doc(db, 'users', uid, 'devices', dev.id), {
          id: dev.id,
          ownerId: uid,
          name: dev.name,
          type: dev.type,
          os: dev.os,
          model: dev.model,
          batteryLevel: dev.batteryLevel,
          isCharging: dev.isCharging,
          ipAddress: dev.ipAddress,
          connectionType: dev.connectionType,
          signalStrength: dev.signalStrength,
          storageUsedGb: dev.storageUsedGb,
          storageTotalGb: dev.storageTotalGb,
          isOnline: dev.isOnline,
          isLocked: dev.isLocked,
          lastSyncTime: dev.lastSyncTime,
          location: dev.location,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      for (const f of INITIAL_FILES) {
        batch.set(doc(db, 'users', uid, 'files', f.id), {
          id: f.id,
          ownerId: uid,
          name: f.name,
          sizeBytes: f.sizeBytes,
          category: f.category,
          extension: f.extension,
          modifiedAt: f.modifiedAt,
          primaryDeviceId: f.primaryDeviceId,
          syncedDeviceIds: f.syncedDeviceIds,
          isStarred: f.isStarred,
          downloadCount: f.downloadCount,
          ...(f.tag ? { tag: f.tag } : {}),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      for (const th of INITIAL_THREADS) {
        batch.set(doc(db, 'users', uid, 'threads', th.id), {
          id: th.id,
          ownerId: uid,
          contactName: th.contactName,
          contactHandle: th.contactHandle,
          ...(th.contactRole ? { contactRole: th.contactRole } : {}),
          channel: th.channel,
          unreadCount: th.unreadCount,
          lastUpdated: th.lastUpdated,
          isPinned: th.isPinned,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      for (const clip of INITIAL_CLIPBOARD) {
        batch.set(doc(db, 'users', uid, 'clipboard', clip.id), {
          id: clip.id,
          ownerId: uid,
          text: clip.text,
          type: clip.type,
          originDeviceId: clip.originDeviceId,
          createdAtLabel: clip.createdAt,
          isPinned: clip.isPinned,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${userPath}/seed`);
    }

    // 2. Seed Messages subcollections after threads exist (satisfies threadExists Master Gate)
    try {
      const msgBatch = writeBatch(db);
      for (const th of INITIAL_THREADS) {
        for (const msg of th.messages) {
          msgBatch.set(doc(db, 'users', uid, 'threads', th.id, 'messages', msg.id), {
            id: msg.id,
            ownerId: uid,
            threadId: th.id,
            sender: msg.sender,
            text: msg.text,
            timestamp: msg.timestamp,
            deviceOriginId: msg.deviceOriginId,
            status: msg.status,
            createdAt: serverTimestamp()
          });
        }
      }
      await msgBatch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${userPath}/threads/messages`);
    }

    // 3. Mark profile as seeded
    try {
      await updateDoc(doc(db, 'users', uid), {
        seeded: true,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, userPath);
    }
  }, []);

  // Initialize user profile & attach real-time Firestore listeners once authenticated
  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;
    const unsubscribers: (() => void)[] = [];

    const bootstrapAndListen = async () => {
      setDataLoading(true);
      const uid = user.uid;
      const userDocRef = doc(db, 'users', uid);

      try {
        const snap = await getDoc(userDocRef);
        if (!snap.exists()) {
          await setDoc(userDocRef, {
            uid,
            displayName: clampString(user.displayName || user.email?.split('@')[0] || 'Wi-Connect User', 100),
            email: clampString(user.email || 'user@wiconnect.local', 254),
            ...(user.photoURL ? { photoURL: user.photoURL.slice(0, 500) } : {}),
            seeded: false,
            settings: INITIAL_SETTINGS,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          await seedUserEcosystem(uid);
        } else {
          const data = snap.data();
          if (data.settings) {
            setSettings(data.settings as SyncSettings);
          }
          if (!data.seeded) {
            await seedUserEcosystem(uid);
          }
        }
      } catch (error) {
        if (!cancelled) {
          handleFirestoreError(error, OperationType.GET, `users/${uid}`);
        }
        return;
      }

      if (cancelled) return;

      // Profile & Settings listener
      unsubscribers.push(
        onSnapshot(
          userDocRef,
          docSnap => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.settings) {
                setSettings(data.settings as SyncSettings);
              }
            }
          },
          error => handleFirestoreError(error, OperationType.GET, `users/${uid}`)
        )
      );

      // Devices listener
      const devicesPath = `users/${uid}/devices`;
      const devicesQuery = query(collection(db, devicesPath), where('ownerId', '==', uid));
      unsubscribers.push(
        onSnapshot(
          devicesQuery,
          snap => {
            const list: Device[] = snap.docs
              .map(d => {
                const data = d.data();
                return {
                  id: data.id,
                  name: data.name,
                  type: data.type,
                  os: data.os,
                  model: data.model,
                  batteryLevel: data.batteryLevel,
                  isCharging: data.isCharging,
                  ipAddress: data.ipAddress,
                  connectionType: data.connectionType,
                  signalStrength: data.signalStrength,
                  storageUsedGb: data.storageUsedGb,
                  storageTotalGb: data.storageTotalGb,
                  isOnline: data.isOnline,
                  isLocked: data.isLocked,
                  lastSyncTime: data.lastSyncTime,
                  location: data.location,
                  _createdMs: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : 0
                };
              })
              .sort((a, b) => a._createdMs - b._createdMs)
              .map(({ _createdMs: _, ...rest }) => rest);

            setRawDevices(list);
            setDataLoading(false);
          },
          error => handleFirestoreError(error, OperationType.LIST, devicesPath)
        )
      );

      // Files listener
      const filesPath = `users/${uid}/files`;
      const filesQuery = query(collection(db, filesPath), where('ownerId', '==', uid));
      unsubscribers.push(
        onSnapshot(
          filesQuery,
          snap => {
            const list: EcosystemFile[] = snap.docs
              .map(d => {
                const data = d.data();
                return {
                  id: data.id,
                  name: data.name,
                  sizeBytes: data.sizeBytes,
                  category: data.category,
                  extension: data.extension,
                  modifiedAt: data.modifiedAt,
                  primaryDeviceId: data.primaryDeviceId,
                  syncedDeviceIds: Array.isArray(data.syncedDeviceIds) ? data.syncedDeviceIds : [],
                  isStarred: Boolean(data.isStarred),
                  downloadCount: Number(data.downloadCount) || 0,
                  tag: data.tag,
                  _createdMs: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : 0
                };
              })
              .sort((a, b) => b._createdMs - a._createdMs)
              .map(({ _createdMs: _, ...rest }) => rest);

            setFiles(list);
          },
          error => handleFirestoreError(error, OperationType.LIST, filesPath)
        )
      );

      // Threads listener
      const threadsPath = `users/${uid}/threads`;
      const threadsQuery = query(collection(db, threadsPath), where('ownerId', '==', uid));
      unsubscribers.push(
        onSnapshot(
          threadsQuery,
          snap => {
            const list = snap.docs
              .map(d => {
                const data = d.data();
                return {
                  id: data.id as string,
                  contactName: data.contactName as string,
                  contactHandle: data.contactHandle as string,
                  contactRole: data.contactRole as string | undefined,
                  channel: data.channel as MessageThread['channel'],
                  unreadCount: Number(data.unreadCount) || 0,
                  lastUpdated: data.lastUpdated as string,
                  isPinned: Boolean(data.isPinned),
                  _createdMs: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : 0
                };
              })
              .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || a._createdMs - b._createdMs)
              .map(({ _createdMs: _, ...rest }) => rest);

            setThreadDocs(list);
          },
          error => handleFirestoreError(error, OperationType.LIST, threadsPath)
        )
      );

      // Clipboard listener
      const clipboardPath = `users/${uid}/clipboard`;
      const clipboardQuery = query(collection(db, clipboardPath), where('ownerId', '==', uid));
      unsubscribers.push(
        onSnapshot(
          clipboardQuery,
          snap => {
            const list: ClipboardItem[] = snap.docs
              .map(d => {
                const data = d.data();
                return {
                  id: data.id,
                  text: data.text,
                  type: data.type,
                  originDeviceId: data.originDeviceId,
                  createdAt: data.createdAtLabel || 'Just now',
                  isPinned: Boolean(data.isPinned),
                  _createdMs: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : 0
                };
              })
              .sort((a, b) => b._createdMs - a._createdMs)
              .map(({ _createdMs: _, ...rest }) => rest);

            setClipboardItems(list);
          },
          error => handleFirestoreError(error, OperationType.LIST, clipboardPath)
        )
      );
    };

    bootstrapAndListen();

    return () => {
      cancelled = true;
      unsubscribers.forEach(unsub => unsub());
    };
  }, [authLoading, user, seedUserEcosystem]);

  // Listen to messages subcollection for each active thread
  useEffect(() => {
    if (!user || threadDocs.length === 0) return;

    const uid = user.uid;
    const msgUnsubs: (() => void)[] = [];

    threadDocs.forEach(th => {
      const msgPath = `users/${uid}/threads/${th.id}/messages`;
      const msgQuery = query(collection(db, msgPath), where('ownerId', '==', uid));
      const unsub = onSnapshot(
        msgQuery,
        snap => {
          const msgs: Message[] = snap.docs
            .map(d => {
              const data = d.data();
              return {
                id: data.id,
                threadId: data.threadId,
                sender: data.sender,
                text: data.text,
                timestamp: data.timestamp,
                deviceOriginId: data.deviceOriginId,
                status: data.status,
                _createdMs: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : 0
              };
            })
            .sort((a, b) => a._createdMs - b._createdMs)
            .map(({ _createdMs: _, ...rest }) => rest);

          setMessagesByThread(prev => ({ ...prev, [th.id]: msgs }));
        },
        error => handleFirestoreError(error, OperationType.LIST, msgPath)
      );
      msgUnsubs.push(unsub);
    });

    return () => {
      msgUnsubs.forEach(u => u());
    };
  }, [user, threadDocs]);

  // Auth actions
  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, []);

  const activeDevice = devices.find(d => d.id === activeDeviceId) || devices[0];

  // Send File to Target Device with simulated animated transfer + Firestore sync
  const sendFileToDevice = useCallback((fileId: string, targetDeviceId: string) => {
    if (!user) return;
    const file = files.find(f => f.id === fileId);
    const targetDev = devices.find(d => d.id === targetDeviceId);
    const sourceDev = devices.find(d => d.id === (file?.primaryDeviceId || activeDeviceId));

    if (!file || !targetDev) return;

    const jobId = 'job-' + Date.now();
    const newJob: SyncJob = {
      id: jobId,
      title: `Transferring ${file.name}`,
      sourceDeviceId: sourceDev?.id || 'dev-macbook',
      targetDeviceId: targetDev.id,
      progress: 10,
      speedMbps: Math.floor(Math.random() * 150) + 220,
      status: 'syncing',
      timestamp: 'Just now'
    };

    setSyncJobs(prev => [newJob, ...prev]);
    addNotification('File Transfer Started', `Sending ${file.name} to ${targetDev.name}...`, 'info');

    let currentProgress = 10;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 25) + 15;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setSyncJobs(prev =>
          prev.map(j => (j.id === jobId ? { ...j, progress: 100, status: 'completed' } : j))
        );

        const nextSynced = file.syncedDeviceIds.includes(targetDeviceId)
          ? file.syncedDeviceIds
          : [...file.syncedDeviceIds, targetDeviceId].slice(0, 20);

        const filePath = `users/${user.uid}/files/${fileId}`;
        updateDoc(doc(db, filePath), {
          syncedDeviceIds: nextSynced,
          updatedAt: serverTimestamp()
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, filePath));

        sound.playSyncSuccess();
        addNotification(
          'Transfer Completed',
          `${file.name} successfully synced to ${targetDev.name}.`,
          'success'
        );
      } else {
        setSyncJobs(prev =>
          prev.map(j => (j.id === jobId ? { ...j, progress: currentProgress } : j))
        );
      }
    }, 400);
  }, [user, files, devices, activeDeviceId, addNotification]);

  // Upload new file
  const uploadFile = useCallback((fileData: { name: string; sizeBytes: number; category: EcosystemFile['category']; extension: string }) => {
    if (!user) return;
    const targetDevId = activeDeviceId === 'all' ? (devices[0]?.id || 'dev-macbook') : activeDeviceId;
    const dev = devices.find(d => d.id === targetDevId);
    const fileId = sanitizeId(`file-${Date.now()}`);
    const filePath = `users/${user.uid}/files/${fileId}`;

    setDoc(doc(db, filePath), {
      id: fileId,
      ownerId: user.uid,
      name: clampString(fileData.name, 255, 'Untitled_File'),
      sizeBytes: Math.max(0, Number(fileData.sizeBytes) || 0),
      category: fileData.category,
      extension: clampString(fileData.extension, 20, 'dat'),
      modifiedAt: 'Just now',
      primaryDeviceId: sanitizeId(targetDevId),
      syncedDeviceIds: [sanitizeId(targetDevId)],
      isStarred: false,
      downloadCount: 0,
      tag: 'Local',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }).catch(err => handleFirestoreError(err, OperationType.CREATE, filePath));

    sound.playSyncSuccess();
    addNotification('File Uploaded', `${fileData.name} saved to ${dev?.name || 'Device'}.`, 'success');
  }, [user, activeDeviceId, devices, addNotification]);

  const deleteFile = useCallback((fileId: string) => {
    if (!user) return;
    const file = files.find(f => f.id === fileId);
    const filePath = `users/${user.uid}/files/${fileId}`;
    deleteDoc(doc(db, filePath)).catch(err => handleFirestoreError(err, OperationType.DELETE, filePath));
    addNotification('File Removed', `${file?.name || 'File'} was removed from ecosystem storage.`, 'info');
  }, [user, files, addNotification]);

  const toggleStarFile = useCallback((fileId: string) => {
    if (!user) return;
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    const filePath = `users/${user.uid}/files/${fileId}`;
    updateDoc(doc(db, filePath), {
      isStarred: !file.isStarred,
      updatedAt: serverTimestamp()
    }).catch(err => handleFirestoreError(err, OperationType.UPDATE, filePath));
  }, [user, files]);

  const downloadFile = useCallback((fileId: string) => {
    if (!user) return;
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    const filePath = `users/${user.uid}/files/${fileId}`;
    updateDoc(doc(db, filePath), {
      downloadCount: file.downloadCount + 1,
      updatedAt: serverTimestamp()
    }).catch(err => handleFirestoreError(err, OperationType.UPDATE, filePath));

    sound.playCopyTap();
    addNotification('File Retrieved', `Downloaded ${file.name} to local browser cache.`, 'success');
  }, [user, files, addNotification]);

  // Messaging handlers
  const markThreadRead = useCallback((threadId: string) => {
    if (!user) return;
    const th = threadDocs.find(t => t.id === threadId);
    if (!th || th.unreadCount === 0) return;
    const threadPath = `users/${user.uid}/threads/${threadId}`;
    updateDoc(doc(db, threadPath), {
      unreadCount: 0,
      updatedAt: serverTimestamp()
    }).catch(err => handleFirestoreError(err, OperationType.UPDATE, threadPath));
  }, [user, threadDocs]);

  const sendMessage = useCallback((threadId: string, text: string) => {
    if (!user || !text.trim()) return;

    const senderDevId = sanitizeId(activeDeviceId === 'all' ? (devices[0]?.id || 'dev-macbook') : activeDeviceId);
    const senderDev = devices.find(d => d.id === senderDevId);
    const msgId = sanitizeId(`msg-${Date.now()}`);
    const msgPath = `users/${user.uid}/threads/${threadId}/messages/${msgId}`;
    const threadPath = `users/${user.uid}/threads/${threadId}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setDoc(doc(db, msgPath), {
      id: msgId,
      ownerId: user.uid,
      threadId,
      sender: 'user',
      text: clampString(text, 4000),
      timestamp: nowTime,
      deviceOriginId: senderDevId,
      status: 'delivered',
      createdAt: serverTimestamp()
    }).catch(err => handleFirestoreError(err, OperationType.CREATE, msgPath));

    updateDoc(doc(db, threadPath), {
      lastUpdated: 'Just now',
      updatedAt: serverTimestamp()
    }).catch(err => handleFirestoreError(err, OperationType.UPDATE, threadPath));

    sound.playMessagePop();

    // Simulate smart reply from peer terminal after 1.8s
    const uid = user.uid;
    setTimeout(() => {
      if (!auth.currentUser || auth.currentUser.uid !== uid) return;
      const responseReplies = [
        `Received on ${senderDev?.name || 'client'}. Broadcast acknowledged across Wi-Connect mesh.`,
        'Sync ping verified: latency 1.2ms. All memory buffers nominal.',
        'File checkpoint recorded. Ready for next command.'
      ];
      const replyText = responseReplies[Math.floor(Math.random() * responseReplies.length)];
      const replyId = sanitizeId(`msg-reply-${Date.now()}`);
      const replyPath = `users/${uid}/threads/${threadId}/messages/${replyId}`;

      setDoc(doc(db, replyPath), {
        id: replyId,
        ownerId: uid,
        threadId,
        sender: 'contact',
        text: clampString(replyText, 4000),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        deviceOriginId: sanitizeId(devices.find(d => d.id === 'dev-linux')?.id || senderDevId),
        status: 'delivered',
        createdAt: serverTimestamp()
      }).catch(err => handleFirestoreError(err, OperationType.CREATE, replyPath));

      const isCurrentlyOpen = activeThreadIdRef.current === threadId;
      updateDoc(doc(db, threadPath), {
        unreadCount: isCurrentlyOpen ? 0 : 1,
        lastUpdated: 'Just now',
        updatedAt: serverTimestamp()
      }).catch(err => handleFirestoreError(err, OperationType.UPDATE, threadPath));

      sound.playMessagePop();
      addNotification('New Message Received', replyText, 'message');
    }, 1800);
  }, [user, activeDeviceId, devices, addNotification]);

  // Clipboard operations
  const copyToClipboard = useCallback(async (item: ClipboardItem): Promise<boolean> => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(item.text);
      }
      sound.playCopyTap();
      addNotification(
        'Copied to Clipboard',
        `Synced snippet from ${devices.find(d => d.id === item.originDeviceId)?.name || 'Device'}.`,
        'success'
      );
      return true;
    } catch (err) {
      console.warn('Clipboard write failed:', err);
      sound.playCopyTap();
      addNotification('Copied', 'Snippet copied into active memory.', 'info');
      return true;
    }
  }, [devices, addNotification]);

  const addClipboardItem = useCallback((text: string, type: ClipboardItem['type'] = 'text') => {
    if (!user || !text.trim()) return;

    let detectedType = type;
    if (text.startsWith('http://') || text.startsWith('https://')) {
      detectedType = 'link';
    } else if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
      try {
        JSON.parse(text);
        detectedType = 'json';
      } catch {
        // keep previous
      }
    } else if (text.includes(';') || text.includes('const ') || text.includes('sudo ') || text.includes('ssh ')) {
      detectedType = 'code';
    }

    const targetDevId = sanitizeId(activeDeviceId === 'all' ? (devices[0]?.id || 'dev-macbook') : activeDeviceId);
    const clipId = sanitizeId(`clip-${Date.now()}`);
    const clipPath = `users/${user.uid}/clipboard/${clipId}`;

    setDoc(doc(db, clipPath), {
      id: clipId,
      ownerId: user.uid,
      text: clampString(text, 10000),
      type: detectedType,
      originDeviceId: targetDevId,
      createdAtLabel: 'Just now',
      isPinned: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }).catch(err => handleFirestoreError(err, OperationType.CREATE, clipPath));

    sound.playCopyTap();
    addNotification('Shared Clipboard Updated', 'Item synced across all paired devices.', 'info');
  }, [user, activeDeviceId, devices, addNotification]);

  const togglePinClipboard = useCallback((id: string) => {
    if (!user) return;
    const item = clipboardItems.find(c => c.id === id);
    if (!item) return;
    const clipPath = `users/${user.uid}/clipboard/${id}`;
    updateDoc(doc(db, clipPath), {
      isPinned: !item.isPinned,
      updatedAt: serverTimestamp()
    }).catch(err => handleFirestoreError(err, OperationType.UPDATE, clipPath));
  }, [user, clipboardItems]);

  const deleteClipboardItem = useCallback((id: string) => {
    if (!user) return;
    const clipPath = `users/${user.uid}/clipboard/${id}`;
    deleteDoc(doc(db, clipPath)).catch(err => handleFirestoreError(err, OperationType.DELETE, clipPath));
  }, [user]);

  // Device & Telemetry operations
  const pingDevice = useCallback((deviceId: string) => {
    const dev = devices.find(d => d.id === deviceId);
    if (!dev) return;

    sound.playDevicePing();
    setPingingIds(prev => new Set(prev).add(deviceId));
    addNotification('Device Ping Transmitted', `Audible sonar ping sent to ${dev.name} (${dev.location}).`, 'device');

    setTimeout(() => {
      setPingingIds(prev => {
        const next = new Set(prev);
        next.delete(deviceId);
        return next;
      });
    }, 2800);
  }, [devices, addNotification]);

  const toggleDeviceLock = useCallback((deviceId: string) => {
    if (!user) return;
    const dev = devices.find(d => d.id === deviceId);
    if (!dev) return;

    const willLock = !dev.isLocked;
    const devPath = `users/${user.uid}/devices/${deviceId}`;
    updateDoc(doc(db, devPath), {
      isLocked: willLock,
      updatedAt: serverTimestamp()
    }).catch(err => handleFirestoreError(err, OperationType.UPDATE, devPath));

    sound.playCopyTap();
    addNotification(
      willLock ? 'Remote Device Locked' : 'Device Unlocked',
      `${dev.name} has been remotely ${willLock ? 'secured' : 'unlocked'}.`,
      'device'
    );
  }, [user, devices, addNotification]);

  const addDevice = useCallback((newDeviceData: Omit<Device, 'id'>) => {
    if (!user) return;
    const id = sanitizeId(`dev-${Date.now()}`);
    const devPath = `users/${user.uid}/devices/${id}`;

    setDoc(doc(db, devPath), {
      id,
      ownerId: user.uid,
      name: clampString(newDeviceData.name, 100, 'New Device'),
      type: newDeviceData.type,
      os: clampString(newDeviceData.os, 100, 'Custom OS'),
      model: clampString(newDeviceData.model, 120, 'Terminal'),
      batteryLevel: Math.min(100, Math.max(0, Number(newDeviceData.batteryLevel) || 80)),
      isCharging: Boolean(newDeviceData.isCharging),
      ipAddress: clampString(newDeviceData.ipAddress, 64, '192.168.1.200'),
      connectionType: newDeviceData.connectionType,
      signalStrength: newDeviceData.signalStrength,
      storageUsedGb: Math.max(0, Number(newDeviceData.storageUsedGb) || 0),
      storageTotalGb: Math.max(1, Number(newDeviceData.storageTotalGb) || 256),
      isOnline: Boolean(newDeviceData.isOnline),
      isLocked: Boolean(newDeviceData.isLocked),
      lastSyncTime: clampString(newDeviceData.lastSyncTime, 64, 'Just now'),
      location: clampString(newDeviceData.location, 120, 'Local Wi-Fi Mesh'),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }).catch(err => handleFirestoreError(err, OperationType.CREATE, devPath));

    sound.playSyncSuccess();
    addNotification('New Device Paired', `${newDeviceData.name} joined the Wi-Connect ecosystem.`, 'success');
  }, [user, addNotification]);

  const removeDevice = useCallback((deviceId: string) => {
    if (!user) return;
    const dev = devices.find(d => d.id === deviceId);
    const devPath = `users/${user.uid}/devices/${deviceId}`;
    deleteDoc(doc(db, devPath)).catch(err => handleFirestoreError(err, OperationType.DELETE, devPath));

    if (activeDeviceId === deviceId) {
      setActiveDeviceId('all');
    }
    addNotification('Device Unpaired', `${dev?.name || 'Device'} was removed from your fleet.`, 'warning');
  }, [user, devices, activeDeviceId, addNotification]);

  // Global Sync
  const triggerGlobalSync = useCallback(() => {
    if (!user) return;
    const jobId = 'job-global-' + Date.now();
    const newJob: SyncJob = {
      id: jobId,
      title: 'Full Ecosystem Catalog Sync',
      sourceDeviceId: devices[0]?.id || 'dev-macbook',
      targetDeviceId: 'All Devices',
      progress: 20,
      speedMbps: 480,
      status: 'syncing',
      timestamp: 'Just now'
    };

    setSyncJobs(prev => [newJob, ...prev]);
    addNotification('Full Sync Initiated', 'Synchronizing files, clipboard & messages across all terminals...', 'info');

    let prog = 20;
    const interval = setInterval(() => {
      prog += 25;
      if (prog >= 100) {
        clearInterval(interval);
        setSyncJobs(prev =>
          prev.map(j => (j.id === jobId ? { ...j, progress: 100, status: 'completed' } : j))
        );

        devices.forEach(d => {
          const devPath = `users/${user.uid}/devices/${d.id}`;
          updateDoc(doc(db, devPath), {
            lastSyncTime: 'Just now',
            updatedAt: serverTimestamp()
          }).catch(err => handleFirestoreError(err, OperationType.UPDATE, devPath));
        });

        sound.playSyncSuccess();
        addNotification('Fleet Synchronized', `All ${devices.length} devices are now in 100% parity.`, 'success');
      } else {
        setSyncJobs(prev =>
          prev.map(j => (j.id === jobId ? { ...j, progress: prog } : j))
        );
      }
    }, 350);
  }, [user, devices, addNotification]);

  const updateSettings = useCallback((newSettings: Partial<SyncSettings>) => {
    if (!user) return;
    const merged: SyncSettings = {
      ...settings,
      ...newSettings,
      maxBandwidthMbps: Math.min(1000, Math.max(50, Number(newSettings.maxBandwidthMbps ?? settings.maxBandwidthMbps))),
      batterySaverThreshold: Math.min(50, Math.max(5, Number(newSettings.batterySaverThreshold ?? settings.batterySaverThreshold)))
    };
    setSettings(merged);

    const userPath = `users/${user.uid}`;
    updateDoc(doc(db, userPath), {
      settings: merged,
      updatedAt: serverTimestamp()
    }).catch(err => handleFirestoreError(err, OperationType.UPDATE, userPath));

    addNotification('Preferences Updated', 'Device sync policies reconfigured.', 'info');
  }, [user, settings, addNotification]);

  const resetAllData = useCallback(async () => {
    if (!user) return;
    const uid = user.uid;
    try {
      // Clear existing subcollections
      const colNames = ['devices', 'files', 'clipboard'] as const;
      for (const col of colNames) {
        const snap = await getDocs(query(collection(db, 'users', uid, col), where('ownerId', '==', uid)));
        const batch = writeBatch(db);
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }

      const thSnap = await getDocs(query(collection(db, 'users', uid, 'threads'), where('ownerId', '==', uid)));
      for (const thDoc of thSnap.docs) {
        const mSnap = await getDocs(
          query(collection(db, 'users', uid, 'threads', thDoc.id, 'messages'), where('ownerId', '==', uid))
        );
        const mBatch = writeBatch(db);
        mSnap.docs.forEach(md => mBatch.delete(md.ref));
        await mBatch.commit();
        await deleteDoc(thDoc.ref);
      }

      await updateDoc(doc(db, 'users', uid), {
        settings: INITIAL_SETTINGS,
        updatedAt: serverTimestamp()
      });

      await seedUserEcosystem(uid);
      setSyncJobs([]);
      setActiveDeviceId('dev-macbook');
      sound.playSyncSuccess();
      addNotification('Factory Reset', 'Wi-Connect cloud state restored to initial demo fleet.', 'warning');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}/reset`);
    }
  }, [user, seedUserEcosystem, addNotification]);

  return (
    <EcosystemContext.Provider
      value={{
        user,
        authLoading,
        dataLoading,
        signInWithGoogle,
        signOutUser,
        devices,
        activeDeviceId,
        activeDevice,
        files,
        messageThreads,
        activeThreadId,
        clipboardItems,
        syncJobs,
        settings,
        notifications,
        activeTab,
        setActiveTab,
        setActiveDeviceId,
        setActiveThreadId,
        uploadFile,
        deleteFile,
        toggleStarFile,
        sendFileToDevice,
        downloadFile,
        sendMessage,
        markThreadRead,
        copyToClipboard,
        addClipboardItem,
        togglePinClipboard,
        deleteClipboardItem,
        pingDevice,
        toggleDeviceLock,
        addDevice,
        removeDevice,
        triggerGlobalSync,
        updateSettings,
        dismissNotification,
        resetAllData
      }}
    >
      {children}
    </EcosystemContext.Provider>
  );
};

export const useEcosystem = () => {
  const context = useContext(EcosystemContext);
  if (!context) {
    throw new Error('useEcosystem must be used within an EcosystemProvider');
  }
  return context;
};
