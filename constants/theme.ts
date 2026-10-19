// Define colores y medidas que usan todas las pantallas para mantener un diseño coherente.
/** Tokens semánticos de interfaz y capas para los dos esquemas de color. */
export const themes = {
  // Colores semánticos para fondos, texto, estados y elevaciones en modo claro.
  light: {
    background: '#EDEFF5', backgroundSecondary: '#E5E9F2', surface: '#F5F6FA', surfaceCard: '#F0F2F8', surfaceRaised: '#F8F9FC', surfaceInset: '#E8ECF5',
    text: '#252B3B', muted: '#687287', subtle: '#818BA0', primary: '#737CE5', primaryStrong: '#5964C9', onPrimary: '#FFFFFF', primarySoft: '#E1E4FC', border: '#D7DDE9', borderHighlight: '#FFFFFF',
    success: '#087A55', successSoft: '#E0F2EA', warning: '#9C610C', warningSoft: '#FBF0DC', danger: '#B4233C', dangerSoft: '#FBE7EA',
    accentCamera: '#777DE0', accentCameraSoft: '#E7E8FB', accentQr: '#278E91', accentQrSoft: '#DDF2F0', accentLocation: '#AC792C', accentLocationSoft: '#F5EBD8', accentSensors: '#765FB8', accentSensorsSoft: '#ECE6F8', accentBiometric: '#8A61A8', accentBiometricSoft: '#F0E7F5',
    shadow: '#263052', reflection: 'rgba(255,255,255,0.78)',
    elevation: {
      0: 'none',
      1: '0px 2px 5px rgba(38,48,82,0.035), 0px 8px 20px rgba(38,48,82,0.055)',
      2: '0px 2px 5px rgba(38,48,82,0.035), 0px 8px 20px rgba(38,48,82,0.065), 0px 20px 48px rgba(38,48,82,0.045)',
      3: '0px 5px 14px rgba(38,48,82,0.055), 0px 16px 34px rgba(38,48,82,0.075), 0px 28px 56px rgba(38,48,82,0.04)',
      4: '0px 8px 20px rgba(38,48,82,0.09), 0px 24px 56px rgba(38,48,82,0.12)',
    },
  },
  // La misma estructura de claves adaptada para el modo oscuro.
  dark: {
    background: '#10131D', backgroundSecondary: '#151A27', surface: '#1C2232', surfaceCard: '#20273A', surfaceRaised: '#252D40', surfaceInset: '#2B3449',
    text: '#F1F3FA', muted: '#AAB3C7', subtle: '#8792AA', primary: '#929AFF', primaryStrong: '#A8AEFF', onPrimary: '#10131D', primarySoft: '#2B3150', border: '#343D53', borderHighlight: '#46516A',
    success: '#7BD4AF', successSoft: '#1B3B37', warning: '#F0C67E', warningSoft: '#3C3325', danger: '#F296A2', dangerSoft: '#452832',
    accentCamera: '#A2A8FF', accentCameraSoft: '#303551', accentQr: '#74D0CC', accentQrSoft: '#203D43', accentLocation: '#E2B975', accentLocationSoft: '#3B3329', accentSensors: '#B8A4F0', accentSensorsSoft: '#342E4C', accentBiometric: '#D0A5DE', accentBiometricSoft: '#3B2D45',
    shadow: '#070912', reflection: 'rgba(255,255,255,0.055)',
    elevation: {
      0: 'none',
      1: '0px 3px 10px rgba(0,0,0,0.16), 0px 10px 22px rgba(0,0,0,0.18), 0px 1px 0px rgba(255,255,255,0.025)',
      2: '0px 4px 12px rgba(0,0,0,0.18), 0px 16px 36px rgba(0,0,0,0.22), 0px 1px 0px rgba(255,255,255,0.035)',
      3: '0px 6px 16px rgba(0,0,0,0.22), 0px 22px 44px rgba(0,0,0,0.24), 0px 1px 0px rgba(255,255,255,0.045)',
      4: '0px 10px 24px rgba(0,0,0,0.28), 0px 28px 64px rgba(0,0,0,0.34), 0px 1px 0px rgba(255,255,255,0.06)',
    },
  },
} as const;

export type ThemeName = keyof typeof themes;
export type ThemeColors = (typeof themes)[ThemeName];
export type Elevation = keyof ThemeColors['elevation'];
export type AccentName = 'camera' | 'qr' | 'location' | 'sensors' | 'biometric';

/** Escalas consistentes de espaciado, tipografía, radios e interacción. */
// Las pantallas y componentes comparten estas medidas para conservar una interfaz uniforme.
export const space = { xxs: 4, xs: 7, sm: 11, md: 16, lg: 22, xl: 30, xxl: 42 } as const;
export const radius = { xs: 10, sm: 14, md: 20, lg: 26, xl: 32, pill: 999 } as const;
export const typeScale = { caption: 12, label: 13, body: 15, bodyLarge: 17, title: 21, headline: 29, display: 35 } as const;
export const motion = { quick: 140, normal: 220, screen: 300 } as const;

