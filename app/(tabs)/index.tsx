import React, { useState } from 'react';
import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { AppearanceDialog, Card, Heading, IconBadge, ScalePressable, Screen } from '../../components/ui';
import { AppIcon } from '../../components/icons';
import { useTheme } from '../../context/ThemeContext';
import { radius, space } from '../../constants/theme';

// Accesos rápidos de Inicio; cada tarjeta apunta a una herramienta del dispositivo.
const tools = [
  { title: 'Cámara', detail: 'Tomá una fotografía', route: '/camera', icon: 'camera', accent: 'accentCamera', soft: 'accentCameraSoft' },
  { title: 'Lector QR', detail: 'Leé códigos de forma segura', route: '/qr', icon: 'qr', accent: 'accentQr', soft: 'accentQrSoft' },
  { title: 'Ubicación', detail: 'Consultá el GPS cuando quieras', route: '/location', icon: 'location', accent: 'accentLocation', soft: 'accentLocationSoft' },
  { title: 'Sensores', detail: 'Acelerómetro y giroscopio', route: '/sensor-tools', icon: 'sensors', accent: 'accentSensors', soft: 'accentSensorsSoft' },
] as const;

/** Panel principal con accesos al dispositivo, biometría y privacidad local. */
export default function HomeScreen() {
  // El ancho de pantalla decide si cada herramienta ocupa media fila o una fila completa.
  const router = useRouter(); const { theme, preference } = useTheme(); const { width } = useWindowDimensions(); const [appearanceOpen, setAppearanceOpen] = useState(false);
  const tileWidth = width < 360 ? '100%' : '48%';
  return <Screen safeTop>
    <View style={styles.brandRow}>
      <View style={[styles.brandMark, { backgroundColor: theme.surfaceCard, borderColor: theme.border, borderTopColor: theme.borderHighlight, boxShadow: theme.elevation[2] }]}><Image accessibilityLabel="Logo de SmartLab" source={require('../../assets/images/splash-icon.png')} resizeMode="contain" style={styles.brandLogo} /></View>
      <View style={styles.brandCopy}><Text style={[styles.brandName, { color: theme.text }]}>SmartLab</Text><Text style={[styles.brandSubtitle, { color: theme.muted }]}>EXPLORÁ TU DISPOSITIVO</Text></View>
      <ScalePressable accessibilityLabel="Cambiar apariencia" onPress={() => setAppearanceOpen(true)} style={[styles.settingsButton, { backgroundColor: theme.surfaceCard, borderColor: theme.border, boxShadow: theme.elevation[1] }]}><AppIcon name="appearance" size={20} color={theme.primaryStrong} /></ScalePressable>
    </View>
    <Heading eyebrow={preference === 'system' ? 'Tu espacio digital' : undefined} title="Explorá tu teléfono." subtitle="Todas las herramientas de tu dispositivo, en un solo lugar." />

    <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: theme.text }]}>Herramientas</Text><Text style={[styles.sectionHint, { color: theme.muted }]}>Accesos rápidos</Text></View>
    <View style={styles.grid}>{tools.map((tool, index) => {
      const accent = theme[tool.accent]; const soft = theme[tool.soft];
      return <View key={tool.title} style={{ width: tileWidth }}><ScalePressable accessibilityLabel={`${tool.title}: ${tool.detail}`} onPress={() => tool.title === 'Sensores' ? router.push('/sensor-tools') : router.push(tool.route as never)} style={[styles.toolTile, { backgroundColor: index % 2 === 0 ? theme.surfaceCard : theme.surface, borderColor: theme.border, borderTopColor: theme.borderHighlight, boxShadow: theme.elevation[2] }]}>
        <IconBadge name={tool.icon} color={accent} background={soft} size={23} containerSize={46} />
        <View style={styles.toolText}><Text style={[styles.toolTitle, { color: theme.text }]}>{tool.title}</Text><Text style={[styles.toolDetail, { color: theme.muted }]}>{tool.detail}</Text></View>
        <View style={[styles.tileAccent, { backgroundColor: accent }]} />
      </ScalePressable></View>;
    })}</View>

    <ScalePressable accessibilityLabel="Abrir biometría: autenticación del sistema" onPress={() => router.push('/biometric')} style={[styles.biometric, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, borderTopColor: theme.borderHighlight, boxShadow: theme.elevation[3] }]}>
      <IconBadge name="biometric" color={theme.accentBiometric} background={theme.accentBiometricSoft} size={24} containerSize={50} />
      <View style={styles.biometricCopy}><Text style={[styles.toolTitle, { color: theme.text }]}>Biometría</Text><Text style={[styles.toolDetail, { color: theme.muted }]}>Autenticación segura del sistema</Text></View>
      <AppIcon name="chevron" size={18} color={theme.subtle} />
    </ScalePressable>

    <Card elevation={1} style={styles.privacyCard}><View style={[styles.privacyIcon, { backgroundColor: theme.successSoft }]}><AppIcon name="shield" size={20} color={theme.success} /></View><View style={styles.privacyCopy}><Text style={[styles.privacyTitle, { color: theme.text }]}>Tus datos, en tu dispositivo</Text><Text style={[styles.privacyText, { color: theme.muted }]}>Las herramientas se activan cuando las usás. Tus datos se guardan localmente al confirmarlo.</Text></View></Card>
    <AppearanceDialog visible={appearanceOpen} onClose={() => setAppearanceOpen(false)} />
  </Screen>;
}

// Distribución del encabezado, la grilla de herramientas y la tarjeta de privacidad.
const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.md, marginBottom: space.xl }, brandMark: { width: 48, height: 48, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, brandLogo: { width: 44, height: 44, borderRadius: radius.sm }, brandCopy: { flex: 1, gap: 2 }, brandName: { fontSize: 19, fontWeight: '800', letterSpacing: 0.1 }, brandSubtitle: { fontSize: 9, fontWeight: '800', letterSpacing: 1.1 }, settingsButton: { width: 44, height: 44, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.sm }, sectionTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 }, sectionHint: { fontSize: 12, fontWeight: '600' }, grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: space.sm, marginBottom: space.sm },
  toolTile: { minHeight: 166, padding: space.md, borderWidth: 1, borderRadius: radius.lg, justifyContent: 'space-between', gap: space.sm }, toolText: { gap: 4 }, toolTitle: { fontSize: 16, lineHeight: 21, fontWeight: '700', letterSpacing: -0.2 }, toolDetail: { fontSize: 12, lineHeight: 17 }, tileAccent: { height: 3, width: 26, borderRadius: 2 },
  biometric: { minHeight: 80, flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderWidth: 1, borderRadius: radius.lg, marginTop: space.sm, marginBottom: space.md }, biometricCopy: { flex: 1, gap: 3 },
  privacyCard: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.sm, marginBottom: 0 }, privacyIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, privacyCopy: { flex: 1, gap: 2 }, privacyTitle: { fontSize: 13, fontWeight: '700' }, privacyText: { fontSize: 11, lineHeight: 16 },
});
