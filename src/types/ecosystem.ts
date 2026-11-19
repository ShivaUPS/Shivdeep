/**
 * Wi-Connect Unified Ecosystem Data Models
 */

export type DeviceType = 'laptop' | 'phone' | 'tablet' | 'desktop' | 'wearable';
export type ConnectionType = 'Wi-Fi 6E' | '5G Ultra' | 'Bluetooth 5.3' | 'Gigabit LAN';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  os: string;
  model: string;
  batteryLevel: number; // 0 - 100
  isCharging: boolean;
  ipAddress: string;
  connectionType: ConnectionType;
  signalStrength: 'strong' | 'good' | 'fair';
  storageUsedGb: number;
  storageTotalGb: number;
  isOnline: boolean;
  isLocked: boolean;
  isPinging?: boolean;
  lastSyncTime: string;
  location: string;
}

export type FileCategory = 'all' | 'document' | 'image' | 'video' | 'archive' | 'audio' | 'code';

export interface EcosystemFile {
  id: string;
  name: string;
  sizeBytes: number;
  category: 'document' | 'image' | 'video' | 'archive' | 'audio' | 'code';
  extension: string;
  modifiedAt: string;
  primaryDeviceId: string;
  syncedDeviceIds: string[];
  isStarred: boolean;
  downloadCount: number;
  tag?: string;
}

export interface Message {
  id: string;
  threadId: string;
  sender: 'user' | 'contact' | 'system';
  text: string;
  timestamp: string;
  deviceOriginId: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface MessageThread {
  id: string;
  contactName: string;
  contactHandle: string;
  contactRole?: string;
  channel: 'sms' | 'intercom' | 'encrypted';
  unreadCount: number;
  lastUpdated: string;
  isPinned: boolean;
  messages: Message[];
}

export interface ClipboardItem {
  id: string;
  text: string;
  type: 'text' | 'link' | 'code' | 'json';
  originDeviceId: string;
  createdAt: string;
  isPinned: boolean;
}

export interface SyncJob {
  id: string;
  title: string;
  sourceDeviceId: string;
  targetDeviceId: string;
  progress: number; // 0 - 100
  speedMbps: number;
  status: 'queued' | 'syncing' | 'completed' | 'failed';
  timestamp: string;
}

export interface SyncSettings {
  autoSyncEnabled: boolean;
  syncOnWifiOnly: boolean;
  backgroundPushEnabled: boolean;
  maxBandwidthMbps: number;
  cloudBackupCadence: 'realtime' | 'hourly' | 'daily' | 'manual';
  soundEffectsEnabled: boolean;
  clipboardSyncEnabled: boolean;
  batterySaverThreshold: number; // percentage
}

export interface NotificationEvent {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'device' | 'message';
  timestamp: string;
}

export type ActiveTab = 'overview' | 'files' | 'messages' | 'clipboard' | 'devices' | 'settings';
