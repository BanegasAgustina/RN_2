import React, { useRef, useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Directory, File, Paths } from 'expo-file-system';
import { useSQLiteContext } from 'expo-sqlite';
import { Screen, Heading, Card, ActionButton, Notice } from '../components/ui';
import { useTheme } from '../context/ThemeContext';
import { savePhoto } from '../database/activities';

// Permite tomar una foto, revisarla y guardarla en el espacio privado de la aplicación.
/** Cámara con previsualización y copia permanente antes de registrar metadatos. */
export default function CameraScreen() {
  // `ready` evita capturar antes de que la vista de cámara termine de abrirse.
  const [permission, requestPermission] = useCameraPermissions(); const [preview, setPreview] = useState<{ uri: string; width: number; height: number } | null>(null);
  const [ready, setReady] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const camera = useRef<CameraView>(null); const db = useSQLiteContext(); const { theme } = useTheme();
  /** Captura una imagen temporal que se muestra para que el usuario la acepte o descarte. */
  const capture = async () => {
    if (!camera.current || !ready || busy) return;
    setBusy(true); setError('');
    try { const photo = await camera.current.takePictureAsync({ quality: 0.85 }); if (photo) setPreview(photo); else setError('La cámara no devolvió una fotografía.'); }
    catch { setError('No se pudo tomar la fotografía. Revisá que la cámara esté disponible.'); }
    finally { setBusy(false); }
  };
  /** Copia la imagen desde caché a Documentos; si SQLite falla, revierte el archivo copiado. */
  const save = async () => {
    if (!preview || busy) return;
    setBusy(true); setError(''); let destination: File | undefined;
    try {
      const folder = new Directory(Paths.document, 'smartlab-photos');
      folder.create({ idempotent: true, intermediates: true });
      destination = new File(folder, `foto-${Date.now()}.jpg`);
      await new File(preview.uri).copy(destination);
      await savePhoto(db, destination.uri, preview.width, preview.height);
      setPreview(null);
    } catch {
      try { destination?.delete(); } catch { /* Si el archivo no llegó a crearse, no hay nada que limpiar. */ }
      setError('No se pudo guardar la fotografía. La captura temporal no se considera guardada.');
    } finally { setBusy(false); }
  };
  if (!permission?.granted) return <Screen><Heading title="Cámara" subtitle="El permiso se solicita cuando elegís utilizar esta herramienta." /><Card><Notice>{permission?.canAskAgain === false ? 'El permiso fue denegado. Habilitá la cámara desde la configuración del teléfono.' : 'SmartLab necesita acceso a la cámara para tomar la fotografía.'}</Notice>{permission?.canAskAgain !== false ? <ActionButton label="Permitir cámara" onPress={() => void requestPermission()} /> : null}</Card></Screen>;
  return <Screen><Heading title={preview ? 'Revisá la fotografía' : 'Cámara'} subtitle={preview ? 'Guardala en el almacenamiento privado de la aplicación o descartala.' : 'La cámara se activa solo mientras esta pantalla está abierta.'} />
    {preview ? <Card><Image accessibilityLabel="Vista previa de la fotografía" source={{ uri: preview.uri }} style={[styles.preview, { backgroundColor: theme.border }]} resizeMode="contain" /><ActionButton label="Guardar fotografía" onPress={() => void save()} loading={busy} /><ActionButton label="Descartar y volver a la cámara" onPress={() => setPreview(null)} secondary disabled={busy} /></Card> : <Card><CameraView ref={camera} style={styles.camera} facing="back" onCameraReady={() => setReady(true)} onMountError={(event) => setError(`No se pudo iniciar la cámara: ${event.message}`)} />
      <ActionButton label="Tomar fotografía" onPress={() => void capture()} loading={busy} disabled={!ready} />{!ready ? <Notice>Preparando cámara…</Notice> : null}</Card>}
    {error ? <Notice tone="danger">{error}</Notice> : null}
  </Screen>;
}
// Tamaños compartidos para el visor en vivo y la revisión de la foto capturada.
const styles = StyleSheet.create({ camera: { height: 420, borderRadius: 16, overflow: 'hidden' }, preview: { width: '100%', height: 420, borderRadius: 16 }, });

