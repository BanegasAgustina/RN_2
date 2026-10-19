import React from 'react';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { migrateDbIfNeeded } from '../database/migrations';

// Crea la base primero, aplica sus migraciones y luego monta tema y navegación.
/** Une la base persistente con el navegador y el tema global de la aplicación. */
export default function RootLayout() {
  return <SQLiteProvider databaseName="smartlab.db" onInit={migrateDbIfNeeded}><ThemeProvider><AppNavigator /></ThemeProvider></SQLiteProvider>;
}
/** Aplica colores y rótulos globales del navegador según el tema elegido. */
function AppNavigator() {
  const { theme, preference } = useTheme();
  // Las rutas de herramientas se abren sobre Inicio; sus títulos y colores siguen el tema.
  return <><StatusBar style={preference === 'system' ? 'auto' : preference === 'dark' ? 'light' : 'dark'} />
    <Stack screenOptions={{ headerStyle: { backgroundColor: theme.surfaceCard }, headerTintColor: theme.text, headerTitleStyle: { fontWeight: '700', fontSize: 17 }, contentStyle: { backgroundColor: theme.background }, headerShadowVisible: false, headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} /><Stack.Screen name="camera" options={{ title: 'Cámara' }} />
      <Stack.Screen name="qr" options={{ title: 'Lector QR' }} /><Stack.Screen name="location" options={{ title: 'Ubicación' }} />
      <Stack.Screen name="sensor-tools" options={{ title: 'Sensores' }} />
      <Stack.Screen name="biometric" options={{ title: 'Biometría' }} />
    </Stack></>;
}
