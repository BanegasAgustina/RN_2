import React, { useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import * as Location from 'expo-location';
import { Screen, Heading, Card, ActionButton, DataLine, Notice } from '../components/ui';
import { saveLocation } from '../database/activities';

// Datos de una única consulta GPS que todavía no se ha guardado.
type Fix = { latitude: number; longitude: number; accuracy: number | null; timestamp: string };

/** Consulta ubicación bajo demanda en primer plano y la guarda solo tras confirmar. */
export default function LocationScreen() {
  // `fix` conserva la posición mostrada; `busy` y `error` reflejan el estado de la consulta.
  const db = useSQLiteContext(); const [fix, setFix] = useState<Fix | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [permissionDenied, setPermissionDenied] = useState(false);
  /** Solicita permiso en el momento de la acción y obtiene una sola posición actual. */
  const locate = async () => {
    setBusy(true); setError(''); setFix(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) { setPermissionDenied(true); setError('Permiso de ubicación denegado. Podés volver a habilitarlo en los ajustes del teléfono.'); return; }
      setPermissionDenied(false);
      if (!await Location.hasServicesEnabledAsync()) { setError('Los servicios de ubicación están desactivados en el teléfono.'); return; }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setFix({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy, timestamp: new Date(position.timestamp).toISOString() });
    } catch { setError('No se pudo obtener una posición. Comprobá el GPS y volvé a intentar.'); }
    finally { setBusy(false); }
  };
  /** Persiste la ubicación obtenida únicamente cuando el usuario toca guardar. */
  const save = async () => {
    if (!fix) return;
    try { await saveLocation(db, fix.latitude, fix.longitude, fix.accuracy); setError('Ubicación guardada localmente.'); }
    catch { setError('No se pudo guardar esta ubicación.'); }
  };
  return <Screen><Heading title="Ubicación" subtitle="Se solicita ubicación en primer plano. No hay seguimiento ni consultas en segundo plano." />
    <Card><ActionButton label="Consultar mi ubicación" onPress={() => void locate()} loading={busy} />
      {permissionDenied ? <Notice tone="danger">La aplicación necesita permiso de ubicación mientras está en uso.</Notice> : null}
      {fix ? <><DataLine label="Latitud" value={fix.latitude.toFixed(6)} /><DataLine label="Longitud" value={fix.longitude.toFixed(6)} /><DataLine label="Precisión" value={fix.accuracy == null ? 'No disponible' : `±${fix.accuracy.toFixed(1)} m`} /><DataLine label="Consulta" value={new Date(fix.timestamp).toLocaleString()} /><ActionButton label="Guardar ubicación localmente" onPress={() => void save()} secondary /></> : <Notice>La ubicación se obtiene solo al tocar el botón y no se guarda hasta que lo confirmes.</Notice>}
      {error ? <Notice tone={error.includes('guardada') ? 'success' : 'danger'}>{error}</Notice> : null}
    </Card>
  </Screen>;
}

