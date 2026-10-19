import React from 'react';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

// Catálogo central de símbolos para que las pantallas compartan los mismos iconos.
/** Símbolos nativos pareados para conservar coherencia en iOS, Android y web. */
// Cada clave interna apunta al símbolo equivalente de iOS, Android y web.
const iconNames = {
  camera: { ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' },
  qr: { ios: 'qrcode.viewfinder', android: 'qr_code_scanner', web: 'qr_code_scanner' },
  location: { ios: 'location.fill', android: 'location_on', web: 'location_on' },
  sensors: { ios: 'waveform.path.ecg', android: 'sensors', web: 'sensors' },
  biometric: { ios: 'touchid', android: 'fingerprint', web: 'fingerprint' },
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  history: { ios: 'clock.arrow.circlepath', android: 'history', web: 'history' },
  settings: { ios: 'gearshape.fill', android: 'settings', web: 'settings' },
  appearance: { ios: 'paintpalette.fill', android: 'palette', web: 'palette' },
  system: { ios: 'circle.lefthalf.filled', android: 'brightness_auto', web: 'brightness_auto' },
  light: { ios: 'sun.max.fill', android: 'light_mode', web: 'light_mode' },
  dark: { ios: 'moon.fill', android: 'dark_mode', web: 'dark_mode' },
  shield: { ios: 'checkmark.shield.fill', android: 'shield', web: 'shield' },
  chevron: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  trash: { ios: 'trash', android: 'delete', web: 'delete' },
  refresh: { ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' },
  info: { ios: 'info.circle.fill', android: 'info', web: 'info' },
  check: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
} as const satisfies Record<string, SymbolViewProps['name']>;

// Limita los iconos a los nombres definidos en el mapa anterior.
export type AppIconName = keyof typeof iconNames;

/** Dibuja un icono vectorial nativo con tamaño y color declarativos. */
export function AppIcon({ name, size = 22, color, style }: { name: AppIconName; size?: number; color: string; style?: SymbolViewProps['style'] }) {
  return <SymbolView name={iconNames[name]} size={size} tintColor={color} weight="semibold" style={style} />;
}

