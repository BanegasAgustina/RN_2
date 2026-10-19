import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, useReducedMotion, useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { motion, radius, space, type Elevation } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { AppIcon, type AppIconName } from './icons';

// Componentes visuales compartidos para conservar el mismo estilo y accesibilidad.
/** Marco adaptable que respeta notch, barra del sistema y la navegación inferior. */
export function Screen({ children, scroll = true, safeTop = false }: React.PropsWithChildren<{ scroll?: boolean; safeTop?: boolean }>) {
  const { theme } = useTheme(); const insets = useSafeAreaInsets();
  const content = <View style={{ padding: space.lg, paddingTop: safeTop ? Math.max(insets.top, space.md) : space.md, paddingBottom: Math.max(insets.bottom, space.lg) + 8 }}>{children}</View>;
  return <View style={[styles.screen, { backgroundColor: theme.background }]}>{scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>{content}</ScrollView> : content}</View>;
}

/** Presenta el título de una pantalla y sus textos auxiliares opcionales. */
export function Heading({ title, subtitle, eyebrow }: { title: string; subtitle?: string; eyebrow?: string }) {
  const { theme } = useTheme();
  return <View style={styles.heading}>{eyebrow ? <Text style={[styles.eyebrow, { color: theme.primary }]}>{eyebrow}</Text> : null}<Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>{title}</Text>{subtitle ? <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text> : null}</View>;
}

/** Tarjeta con niveles de elevación reales y un reflejo superior discreto. */
export function Card({ children, style, elevation = 2, inset = false, animated = true }: React.PropsWithChildren<{ style?: ViewStyle; elevation?: Elevation; inset?: boolean; animated?: boolean }>) {
  const { theme } = useTheme(); const reduceMotion = useReducedMotion();
  const content = <View style={[styles.card, { backgroundColor: inset ? theme.surfaceInset : elevation >= 3 ? theme.surfaceRaised : theme.surfaceCard, borderColor: theme.border, borderTopColor: theme.borderHighlight, boxShadow: theme.elevation[elevation], elevation: elevation === 0 ? 0 : elevation === 1 ? 2 : elevation === 2 ? 4 : elevation === 3 ? 7 : 12 }, elevation === 0 && styles.flatCard, style]}>{children}</View>;
  return animated && !reduceMotion ? <Animated.View entering={FadeInDown.duration(motion.normal)}>{content}</Animated.View> : content;
}

/** Botón reutilizable con animación breve, accesibilidad y soporte para movimiento reducido. */
export function ScalePressable({ children, style, onPress, onLongPress, onPressIn, onPressOut, disabled, accessibilityLabel, accessibilityRole = 'button', accessibilityState, hitSlop }: React.PropsWithChildren<{
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>); onPress?: () => void; onLongPress?: () => void; onPressIn?: () => void; onPressOut?: () => void; disabled?: boolean; accessibilityLabel?: string; accessibilityRole?: 'button' | 'tab' | 'radio'; accessibilityState?: { selected?: boolean; checked?: boolean; disabled?: boolean }; hitSlop?: number;
}>) {
  const reduceMotion = useReducedMotion(); const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const transition = (value: number) => { scale.set(withTiming(value, { duration: reduceMotion ? 0 : motion.quick })); };
  return <Animated.View style={animatedStyle}><Pressable accessibilityRole={accessibilityRole} accessibilityLabel={accessibilityLabel} accessibilityState={accessibilityState} hitSlop={hitSlop} disabled={disabled} onPress={onPress} onLongPress={onLongPress} onPressIn={() => { transition(0.975); onPressIn?.(); }} onPressOut={() => { transition(1); onPressOut?.(); }} style={({ pressed }) => [typeof style === 'function' ? style({ pressed }) : style, disabled && { opacity: 0.48 }]}>{children}</Pressable></Animated.View>;
}

/** Coloca un icono dentro de una base cuadrada de color suave. */
export function IconBadge({ name, color, background, size = 22, containerSize = 48 }: { name: AppIconName; color?: string; background?: string; size?: number; containerSize?: number }) {
  const { theme } = useTheme();
  return <View style={{ width: containerSize, height: containerSize, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: background ?? theme.primarySoft }}><AppIcon name={name} size={size} color={color ?? theme.primary} /></View>;
}

/** Botón de acción principal o secundario; muestra un indicador durante la espera. */
export function ActionButton({ label, onPress, secondary = false, disabled = false, loading = false, icon }: { label: string; onPress: () => void; secondary?: boolean; disabled?: boolean; loading?: boolean; icon?: AppIconName }) {
  const { theme } = useTheme();
  return <ScalePressable accessibilityLabel={label} disabled={disabled || loading} onPress={onPress} style={[styles.button, { backgroundColor: secondary ? theme.primarySoft : theme.primaryStrong, borderColor: secondary ? theme.border : theme.primaryStrong, boxShadow: theme.elevation[1] }]}>
    {loading ? <ActivityIndicator color={secondary ? theme.primary : theme.onPrimary} /> : <View style={styles.buttonContent}>{icon ? <AppIcon name={icon} size={19} color={secondary ? theme.primary : theme.onPrimary} /> : null}<Text style={[styles.buttonText, { color: secondary ? theme.primary : theme.onPrimary }]}>{label}</Text></View>}
  </ScalePressable>;
}

/** Mensaje informativo, de error o de éxito con colores semánticos del tema. */
export function Notice({ children, tone = 'muted' }: React.PropsWithChildren<{ tone?: 'muted' | 'danger' | 'success' }>) {
  const { theme } = useTheme(); const color = tone === 'danger' ? theme.danger : tone === 'success' ? theme.success : theme.muted;
  const bg = tone === 'danger' ? theme.dangerSoft : tone === 'success' ? theme.successSoft : theme.surfaceInset;
  return <View accessibilityRole={tone === 'danger' ? 'alert' : undefined} style={[styles.notice, { backgroundColor: bg }]}><Text style={{ color, fontSize: 13, lineHeight: 20 }}>{children}</Text></View>;
}

/** Fila compacta para presentar una etiqueta y un valor legible o seleccionable. */
export function DataLine({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme(); return <View style={[styles.dataLine, { borderBottomColor: theme.border }]}><Text style={[styles.label, { color: theme.muted }]}>{label}</Text><Text selectable style={[styles.value, { color: theme.text }]}>{value}</Text></View>;
}

/** Diálogo de confirmación temático para acciones destructivas ya existentes. */
export function ConfirmDialog({ visible, title, message, confirmLabel = 'Eliminar', onCancel, onConfirm }: { visible: boolean; title: string; message: string; confirmLabel?: string; onCancel: () => void; onConfirm: () => void }) {
  const { theme } = useTheme(); const insets = useSafeAreaInsets();
  return <Modal transparent visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
    <View style={[styles.dialogBackdrop, { paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.md }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Cerrar diálogo" style={StyleSheet.absoluteFill} onPress={onCancel} />
      <Card elevation={4} animated={false} style={styles.dialogCard}>
        <IconBadge name="trash" color={theme.danger} background={theme.dangerSoft} />
        <Text accessibilityRole="header" style={[styles.dialogTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>{message}</Text>
        <View style={styles.dialogActions}><View style={styles.dialogButton}><ActionButton label="Cancelar" onPress={onCancel} secondary /></View><View style={styles.dialogButton}><ScalePressable accessibilityLabel={confirmLabel} onPress={onConfirm} style={[styles.button, { backgroundColor: theme.danger, borderColor: theme.danger, boxShadow: theme.elevation[1] }]}><Text style={[styles.buttonText, { color: theme.background }]}>{confirmLabel}</Text></ScalePressable></View></View>
      </Card>
    </View>
  </Modal>;
}

/** Estado vacío que explica qué sección se muestra y qué contiene. */
export function EmptyState({ icon = 'info', title, children }: React.PropsWithChildren<{ icon?: AppIconName; title: string }>) {
  const { theme } = useTheme();
  return <Card elevation={1} style={styles.empty}><IconBadge name={icon} /><Text style={[styles.emptyTitle, { color: theme.text }]}>{title}</Text><Text style={[styles.subtitle, { color: theme.muted }]}>{children}</Text></Card>;
}

/** Selector rápido de tema para el acceso superior de Inicio. */
export function AppearanceDialog({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { theme, preference, setPreference } = useTheme(); const insets = useSafeAreaInsets();
  const options = [
    { key: 'system' as const, label: 'Sistema', detail: 'Seguí la apariencia del dispositivo', icon: 'system' as const },
    { key: 'light' as const, label: 'Claro', detail: 'Perla y lavanda', icon: 'light' as const },
    { key: 'dark' as const, label: 'Oscuro', detail: 'Deep night', icon: 'dark' as const },
  ];
  return <Modal transparent visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onClose}>
    <View style={[styles.dialogBackdrop, { paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.md }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Cerrar apariencia" style={StyleSheet.absoluteFill} onPress={onClose} />
      <Card elevation={4} animated={false} style={styles.appearanceCard}>
        <View style={styles.appearanceHeading}><View style={styles.buttonContent}><AppIcon name="appearance" size={20} color={theme.primary} /><Text accessibilityRole="header" style={[styles.dialogTitle, { color: theme.text }]}>Apariencia</Text></View><ScalePressable accessibilityLabel="Cerrar" onPress={onClose} style={[styles.closeButton, { backgroundColor: theme.surfaceInset }]}><AppIcon name="close" size={17} color={theme.muted} /></ScalePressable></View>
        {options.map((option) => {
          const selected = preference === option.key;
          return <ScalePressable key={option.key} accessibilityRole="radio" accessibilityLabel={`${option.label}: ${option.detail}`} accessibilityState={{ checked: selected }} onPress={() => { void setPreference(option.key); onClose(); }} style={[styles.appearanceOption, { backgroundColor: selected ? theme.primarySoft : theme.surface, borderColor: selected ? theme.primary : theme.border }]}>
            <IconBadge name={option.icon} color={selected ? theme.primaryStrong : theme.muted} background={selected ? theme.surfaceRaised : theme.surfaceInset} containerSize={42} size={19} />
            <View style={styles.appearanceCopy}><Text style={[styles.appearanceLabel, { color: selected ? theme.primaryStrong : theme.text }]}>{option.label}</Text><Text style={[styles.appearanceDetail, { color: theme.muted }]}>{option.detail}</Text></View>
            {selected ? <AppIcon name="check" size={18} color={theme.primaryStrong} /> : null}
          </ScalePressable>;
        })}
      </Card>
    </View>
  </Modal>;
}

// Estilos base compartidos por pantallas, tarjetas, botones, mensajes y diálogos.
const styles = StyleSheet.create({
  screen: { flex: 1 }, heading: { marginBottom: space.lg, gap: space.xs }, eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.3, textTransform: 'uppercase' },
  title: { fontSize: 30, fontWeight: '700', letterSpacing: -0.8, lineHeight: 37 }, subtitle: { fontSize: 15, lineHeight: 22 },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: space.md, marginBottom: space.md, gap: space.sm }, flatCard: { borderWidth: 0 },
  button: { minHeight: 50, borderRadius: radius.sm, borderWidth: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: space.md, paddingVertical: space.sm }, buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm }, buttonText: { fontSize: 15, fontWeight: '700' },
  notice: { borderRadius: radius.sm, padding: space.sm }, dataLine: { gap: 4, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth }, label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }, value: { fontSize: 15, lineHeight: 22 },
  dialogBackdrop: { flex: 1, backgroundColor: 'rgba(8,12,24,0.48)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: space.lg }, dialogCard: { width: '100%', maxWidth: 420, padding: space.lg }, dialogTitle: { fontSize: 21, fontWeight: '700', letterSpacing: -0.3 }, dialogActions: { flexDirection: 'row', gap: space.sm, marginTop: space.sm }, dialogButton: { flex: 1 }, empty: { alignItems: 'flex-start' }, emptyTitle: { fontSize: 17, fontWeight: '700' },
  appearanceCard: { width: '100%', maxWidth: 420, padding: space.lg }, appearanceHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.sm }, closeButton: { width: 38, height: 38, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' }, appearanceOption: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: space.sm, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: space.sm, paddingVertical: 8, marginTop: space.xs }, appearanceCopy: { flex: 1, gap: 2 }, appearanceLabel: { fontSize: 14, fontWeight: '700' }, appearanceDetail: { fontSize: 12, lineHeight: 17 },
});
