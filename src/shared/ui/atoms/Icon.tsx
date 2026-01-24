/**
 * Icon Atom
 * Componente per icone vettoriali Apple-style usando Ionicons
 * Ionicons sono simili agli SF Symbols di Apple
 */

import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SemanticColorKey } from '../tokens';
import { useTheme } from '../theme';

/**
 * Icon names mapping to Ionicons (Apple-style)
 */
export const iconMap = {
  // Navigation
  calendar: 'calendar-outline',
  calendarFilled: 'calendar',
  todo: 'checkmark-circle-outline',
  todoFilled: 'checkmark-circle',
  wallet: 'wallet-outline',
  walletFilled: 'wallet',
  home: 'home-outline',
  homeFilled: 'home',
  settings: 'settings-outline',
  settingsFilled: 'settings',

  // Actions
  add: 'add',
  addCircle: 'add-circle-outline',
  remove: 'remove',
  close: 'close',
  closeCircle: 'close-circle-outline',
  check: 'checkmark',
  checkCircle: 'checkmark-circle',
  edit: 'pencil',
  delete: 'trash-outline',
  deleteFilled: 'trash',
  search: 'search',
  filter: 'filter',
  options: 'options',
  sort: 'swap-vertical',
  refresh: 'refresh',
  share: 'share-outline',
  shareFilled: 'share',
  copy: 'copy-outline',
  more: 'ellipsis-horizontal',
  moreVert: 'ellipsis-vertical',

  // Arrows
  chevronRight: 'chevron-forward',
  chevronLeft: 'chevron-back',
  chevronDown: 'chevron-down',
  chevronUp: 'chevron-up',
  arrowBack: 'arrow-back',
  arrowForward: 'arrow-forward',
  arrowUp: 'arrow-up',
  arrowDown: 'arrow-down',

  // Status
  info: 'information-circle',
  infoOutline: 'information-circle-outline',
  warning: 'warning',
  warningOutline: 'warning-outline',
  error: 'alert-circle',
  errorOutline: 'alert-circle-outline',
  success: 'checkmark-circle',
  successOutline: 'checkmark-circle-outline',

  // Priority
  priorityHigh: 'flag',
  priorityMedium: 'flag-outline',
  priorityLow: 'remove-circle-outline',
  star: 'star',
  starOutline: 'star-outline',
  starHalf: 'star-half',

  // Categories
  food: 'restaurant-outline',
  foodFilled: 'restaurant',
  transport: 'car-outline',
  transportFilled: 'car',
  entertainment: 'film-outline',
  entertainmentFilled: 'film',
  shopping: 'bag-outline',
  shoppingFilled: 'bag',
  health: 'medical-outline',
  healthFilled: 'medical',
  bills: 'document-text-outline',
  billsFilled: 'document-text',
  other: 'apps-outline',
  work: 'briefcase-outline',
  workFilled: 'briefcase',
  education: 'school-outline',
  educationFilled: 'school',
  travel: 'airplane-outline',
  travelFilled: 'airplane',
  gift: 'gift-outline',
  giftFilled: 'gift',
  savings: 'trending-up',

  // Time
  clock: 'time-outline',
  time: 'time-outline',
  timeFilled: 'time',
  alarm: 'alarm-outline',
  alarmFilled: 'alarm',
  schedule: 'calendar-outline',
  today: 'today-outline',
  todayFilled: 'today',
  dateRange: 'calendar-outline',

  // Misc
  heart: 'heart',
  heartOutline: 'heart-outline',
  tag: 'pricetag',
  tagOutline: 'pricetag-outline',
  note: 'document',
  noteOutline: 'document-outline',
  noteAdd: 'document-attach-outline',
  attachment: 'attach',
  link: 'link',
  location: 'location',
  locationOutline: 'location-outline',
  person: 'person',
  personOutline: 'person-outline',
  people: 'people',
  peopleOutline: 'people-outline',
  notifications: 'notifications',
  notificationsOutline: 'notifications-outline',
  notificationsOff: 'notifications-off-outline',
  lock: 'lock-closed',
  lockOutline: 'lock-closed-outline',
  unlock: 'lock-open-outline',
  visibility: 'eye',
  visibilityOutline: 'eye-outline',
  visibilityOff: 'eye-off-outline',
  eye: 'eye-outline',
  eyeOff: 'eye-off-outline',
  mail: 'mail-outline',
  mailFilled: 'mail',
  login: 'log-in-outline',
  logout: 'log-out-outline',
  personAdd: 'person-add-outline',
  personAddFilled: 'person-add',
  help: 'help-circle',
  helpOutline: 'help-circle-outline',
  language: 'language-outline',

  // Media controls
  pause: 'pause-outline',
  pauseFilled: 'pause',
  play: 'play-outline',
  playFilled: 'play',
  stop: 'stop-outline',
  stopFilled: 'stop',

  // Media
  image: 'image-outline',
  imageFilled: 'image',
  camera: 'camera-outline',
  cameraFilled: 'camera',
  mic: 'mic-outline',
  micFilled: 'mic',
  volume: 'volume-high-outline',
  volumeOff: 'volume-mute-outline',

  // UI
  menu: 'menu',
  list: 'list',
  grid: 'grid-outline',
  gridFilled: 'grid',
  dashboard: 'apps-outline',
  inbox: 'mail-outline',
  inboxFilled: 'mail',
  archive: 'archive-outline',
  archiveFilled: 'archive',
  folder: 'folder-outline',
  folderFilled: 'folder',
  folderOpen: 'folder-open-outline',
  undo: 'arrow-undo',
  redo: 'arrow-redo',
  sync: 'sync-outline',
  syncFilled: 'sync',
  pin: 'pin-outline',
  pinFilled: 'pin',
  document: 'document-outline',
  documentFilled: 'document',
  checkbox: 'checkbox',
  checkboxOutline: 'checkbox-outline',
  trash: 'trash-outline',
  trashFilled: 'trash',

  // Finance
  money: 'cash-outline',
  moneyFilled: 'cash',
  creditCard: 'card-outline',
  creditCardFilled: 'card',
  receipt: 'receipt-outline',
  receiptFilled: 'receipt',
  trending: 'trending-up',
  trendingDown: 'trending-down',
  target: 'disc-outline',
  targetFilled: 'disc',
  repeat: 'repeat-outline',
  repeatFilled: 'repeat',
  statsChart: 'stats-chart-outline',
  statsChartFilled: 'stats-chart',
  pieChart: 'pie-chart-outline',
  pieChartFilled: 'pie-chart',
  barChart: 'bar-chart-outline',
  barChartFilled: 'bar-chart',
  bankAccount: 'business-outline',
  bankAccountFilled: 'business',
  cashOutline: 'cash-outline',
  cashFilled: 'cash',
  priceTag: 'pricetag-outline',
  priceTagFilled: 'pricetag',
  percentage: 'cellular-outline',
  swap: 'swap-horizontal-outline',
  swapVertical: 'swap-vertical-outline',
  arrowUpCircle: 'arrow-up-circle-outline',
  arrowDownCircle: 'arrow-down-circle-outline',
  layers: 'layers-outline',
  layersFilled: 'layers',

  // Apple-like icons
  sparkles: 'sparkles',
  flash: 'flash-outline',
  flashFilled: 'flash',
  moon: 'moon-outline',
  moonOutline: 'moon-outline',
  moonFilled: 'moon',
  sunny: 'sunny-outline',
  sunnyFilled: 'sunny',
  cloud: 'cloud-outline',
  cloudFilled: 'cloud',
  battery: 'battery-half-outline',
  wifi: 'wifi',
  bluetooth: 'bluetooth',
  qrCode: 'qr-code-outline',
  barcode: 'barcode-outline',
  fingerprint: 'finger-print-outline',
  key: 'key-outline',
  keyFilled: 'key',
} as const;

export type IconName = keyof typeof iconMap;

/**
 * Icon sizes
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

const iconSizes: Record<IconSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 40,
};

/**
 * Icon Props
 */
export interface IconProps {
  /** Nome dell'icona */
  name: IconName;
  /** Dimensione */
  size?: IconSize;
  /** Colore (semantic color key) */
  color?: SemanticColorKey;
  /** Accessibilita */
  accessibilityLabel?: string;
}

/**
 * Icon Component
 * Renderizza icone vettoriali usando Ionicons (Apple-style)
 */
export function Icon({
  name,
  size = 'md',
  color = 'textPrimary',
  accessibilityLabel,
}: IconProps): JSX.Element {
  const theme = useTheme();
  const iconSize = iconSizes[size];
  const iconName = iconMap[name];

  return (
    <Ionicons
      name={iconName}
      size={iconSize}
      color={theme.colors[color]}
      accessibilityLabel={accessibilityLabel}
    />
  );
}

/**
 * Get raw icon size in pixels
 */
export function getIconSize(size: IconSize): number {
  return iconSizes[size];
}
