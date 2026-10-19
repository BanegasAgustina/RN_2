import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { Screen, Heading, Card, Notice, DataLine, IconBadge } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';

// Muestra cómo se solicitan y almacenan permisos y datos, además de la versión de la app.
/** Pantalla de ajustes enfocada en privacidad, permisos e información. */
export default function SettingsScreen() {
  const { theme } = useTheme();
  return <Screen safeTop><Heading title="Ajustes" subtitle="Privacidad, permisos e información de SmartLab." />
    <Card><View style={styles.sectionHead}><IconBadge name="shield" color={theme.success} background={theme.successSoft} containerSize={42} size={20} /><Text style={[styles.title, { color: theme.text }]}>Privacidad y permisos</Text></View><Notice>La cámara y la ubicación se solicitan al abrir cada herramienta. La ubicación se consulta solo en primer plano y se guarda únicamente cuando la confirmás. SmartLab no abre enlaces QR automáticamente.</Notice><Notice>Los datos asociados a las herramientas y tus preferencias se guardan localmente en SQLite. Las fotografías se almacenan en el espacio privado de la aplicación.</Notice><Notice>La biometría se delega al sistema operativo: SmartLab no lee ni guarda huellas ni imágenes faciales.</Notice></Card>
    <Card elevation={1}><View style={styles.sectionHead}><IconBadge name="info" containerSize={42} size={20} /><Text style={[styles.title, { color: theme.text }]}>Información</Text></View><DataLine label="Aplicación" value="SmartLab" /><DataLine label="Versión" value={Constants.expoConfig?.version ?? 'No disponible'} /><DataLine label="Entorno" value="Expo Go compatible" /></Card>
  </Screen>;
}

// Alineación de icono y título usada en las tarjetas de ajustes.
const styles = StyleSheet.create({ sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10 }, title: { fontSize: 17, fontWeight: '700' } });
