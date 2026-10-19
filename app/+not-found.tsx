import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { ActionButton, Card, IconBadge, Screen } from '../components/ui';
import { useTheme } from '../context/ThemeContext';
import { space } from '../constants/theme';

// Presenta una salida clara cuando el usuario abre una dirección que no existe.
/** Estado de ruta inexistente alineado con la identidad visual global. */
export default function NotFoundScreen() {
  const { theme } = useTheme(); const router = useRouter();
  return <>
    <Stack.Screen options={{ title: 'No encontrada' }} />
    <Screen><Card elevation={1} style={styles.card}><IconBadge name="info" /><Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>Esta pantalla no existe.</Text><Text style={[styles.subtitle, { color: theme.muted }]}>La dirección puede haber cambiado o no estar disponible.</Text><ActionButton label="Volver al inicio" onPress={() => router.replace('/')} /></Card></Screen>
  </>;
}

// Espaciado y tipografía del mensaje de ruta no encontrada.
const styles = StyleSheet.create({ card: { marginTop: space.xxl, padding: space.lg, alignItems: 'flex-start' }, title: { fontSize: 22, fontWeight: '700' }, subtitle: { fontSize: 15, lineHeight: 22, marginBottom: space.sm } });
