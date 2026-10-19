import React, { useRef, useState } from 'react';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useSQLiteContext } from 'expo-sqlite';
import { Screen, Heading, Card, ActionButton, Notice, DataLine } from '../components/ui';
import { saveQr } from '../database/activities';

// Lee códigos QR y muestra el contenido como texto para que el usuario decida qué hacer.
/** Lector QR con bloqueo por lectura; el contenido nunca se ejecuta ni abre. */
export default function QrScreen() {
  // El ref impide procesar varias veces el mismo QR mientras la cámara sigue activa.
  const [permission, requestPermission] = useCameraPermissions(); const [scanned, setScanned] = useState<BarcodeScanningResult | null>(null);
  const [error, setError] = useState(''); const [saving, setSaving] = useState(false); const handled = useRef(false); const db = useSQLiteContext();
  /** Acepta un único evento y persiste el texto como dato sin interpretar. */
  const onScanned = async (result: BarcodeScanningResult) => {
    if (handled.current || saving) return;
    handled.current = true; setScanned(result); setSaving(true); setError('');
    try { await saveQr(db, result.data, result.type); }
    catch { setError('El código se leyó, pero no se pudo guardar localmente.'); }
    finally { setSaving(false); }
  };
  /** Reactiva la cámara para comenzar una sesión de lectura nueva. */
  const rescan = () => { handled.current = false; setScanned(null); setError(''); };
  if (!permission?.granted) return <Screen><Heading title="Lector QR" subtitle="SmartLab pide permiso de cámara solo para leer un código." /><Card><Notice>{permission?.canAskAgain === false ? 'Permiso denegado. Habilitá cámara desde la configuración del teléfono.' : 'Se necesita acceso a cámara para detectar el QR.'}</Notice>{permission?.canAskAgain !== false ? <ActionButton label="Permitir cámara" onPress={() => void requestPermission()} /> : null}</Card></Screen>;
  return <Screen><Heading title="Lector QR" subtitle="Apuntá la cámara al código. El contenido no se abre ni se ejecuta automáticamente." />
    <Card>{!scanned ? <CameraView style={{ height: 390, borderRadius: 16, overflow: 'hidden' }} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={(result) => void onScanned(result)} onMountError={(event) => setError(`No se pudo iniciar la cámara: ${event.message}`)} /> : <><Notice tone="success">Código leído. {saving ? 'Guardando lectura…' : error ? '' : 'Lectura guardada.'}</Notice><DataLine label="Formato" value={scanned.type} /><DataLine label="Contenido" value={scanned.data} /><ActionButton label="Leer otro código" onPress={rescan} /></>}
      {error ? <Notice tone="danger">{error}</Notice> : null}</Card>
  </Screen>;
}

