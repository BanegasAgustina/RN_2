// Pantalla abierta desde la tarjeta de Inicio para consultar acelerómetro y giroscopio.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { useSQLiteContext } from 'expo-sqlite';
import { Screen, Heading, Card, ActionButton, DataLine, Notice, IconBadge } from '../components/ui';
import { AppIcon } from '../components/icons';
import { useTheme } from '../context/ThemeContext';
import { saveSensorReading } from '../database/activities';
import type { SensorMeasurement } from '../types';

type Reading = { x: number; y: number; z: number };
// Tipo mínimo compartido por las suscripciones de ambos sensores.
type SensorSubscription = { remove: () => void };
// Lectura inicial para limpiar los tres ejes al cambiar o detener el sensor.
const empty: Reading = { x: 0, y: 0, z: 0 };

/** Lecturas manuales del acelerómetro y el giroscopio con suscripción única. */
export default function SensorsScreen() {
  // `available` proviene del hardware real; `active` indica qué sensor está enviando valores.
  const db = useSQLiteContext(); const { theme } = useTheme();
  const [available, setAvailable] = useState({ accelerometer: false, gyroscope: false, loaded: false });
  const [active, setActive] = useState<'Acelerómetro' | 'Giroscopio' | null>(null);
  const [reading, setReading] = useState<Reading>(empty); const [error, setError] = useState('');
  const subscription = useRef<SensorSubscription | null>(null);

  // La disponibilidad depende del hardware real del teléfono; no se inventan lecturas.
  useEffect(() => { let mounted = true;
    Promise.all([Accelerometer.isAvailableAsync(), Gyroscope.isAvailableAsync()]).then(([a, g]) => { if (mounted) setAvailable({ accelerometer: a, gyroscope: g, loaded: true }); }).catch(() => { if (mounted) { setAvailable((previous) => ({ ...previous, loaded: true })); setError('No se pudo consultar la disponibilidad de los sensores.'); } });
    return () => { mounted = false; subscription.current?.remove(); subscription.current = null; };
  }, []);

  // Las pestañas pueden permanecer montadas; el foco garantiza que no lea en segundo plano.
  useFocusEffect(useCallback(() => () => {
    subscription.current?.remove(); subscription.current = null; setActive(null);
  }, []));

  /** Inicia un sensor después de retirar cualquier suscripción anterior. */
  // Sustituye cualquier escucha previa y empieza a recibir valores cada 250 milisegundos.
  const start = async (sensor: 'Acelerómetro' | 'Giroscopio') => {
    subscription.current?.remove(); subscription.current = null; setError(''); setReading(empty);
    const sensorModule = sensor === 'Acelerómetro' ? Accelerometer : Gyroscope;
    const isAvailable = sensor === 'Acelerómetro' ? available.accelerometer : available.gyroscope;
    if (!isAvailable) { setError(`${sensor} no está disponible en este dispositivo.`); return; }
    try {
      sensorModule.setUpdateInterval(250);
      subscription.current = sensor === 'Acelerómetro'
        ? Accelerometer.addListener((value) => setReading({ x: value.x, y: value.y, z: value.z }))
        : Gyroscope.addListener((value) => setReading({ x: value.x, y: value.y, z: value.z }));
      setActive(sensor);
    } catch { setError(`No se pudo iniciar ${sensor.toLowerCase()}.`); }
  };
  /** Detiene la escucha y libera el recurso nativo antes de cambiar de pantalla. */
  // Detiene la escucha sin guardar la lectura.
  const stop = () => { subscription.current?.remove(); subscription.current = null; setActive(null); };
  /** Conserva en SQLite únicamente la muestra que el usuario elige guardar. */
  // Guarda una muestra de los valores actuales solo cuando el usuario lo solicita.
  const save = async () => {
    if (!active) return;
    const measurement: SensorMeasurement = { sensor: active, ...reading, unit: active === 'Acelerómetro' ? 'g' : 'rad/s' };
    try { await saveSensorReading(db, measurement); setError(''); } catch { setError('No se pudo guardar la medición.'); }
  };
  const unit = active === 'Giroscopio' ? 'rad/s' : 'g';
  return <Screen safeTop><Heading title="Sensores" subtitle="Aceleración en g (incluye gravedad) y velocidad angular en rad/s. X, Y y Z corresponden a los ejes del teléfono." />
    <Card elevation={1}><View style={styles.sectionHead}><IconBadge name="sensors" size={19} containerSize={40} /><Text style={[styles.cardTitle, { color: theme.text }]}>Disponibilidad del dispositivo</Text></View><DataLine label="Acelerómetro" value={!available.loaded ? 'Consultando…' : available.accelerometer ? 'Disponible' : 'No disponible'} /><DataLine label="Giroscopio" value={!available.loaded ? 'Consultando…' : available.gyroscope ? 'Disponible' : 'No disponible'} /></Card>
    <Card elevation={2}><View style={styles.sectionHead}><AppIcon name="sensors" size={20} color={theme.primary} /><Text style={[styles.cardTitle, { color: theme.text }]}>{active ?? 'Elegí un sensor'}</Text></View>
      {active ? <View style={styles.axisRow}>{(['x', 'y', 'z'] as const).map((axis) => <View key={axis} style={[styles.axis, { backgroundColor: theme.primarySoft }]}><Text style={[styles.axisLabel, { color: theme.muted }]}>{axis.toUpperCase()}</Text><Text style={[styles.axisValue, { color: theme.primary }]}>{reading[axis].toFixed(3)}</Text><Text style={[styles.unit, { color: theme.muted }]}>{unit}</Text></View>)}</View> : <Notice>Iniciá una lectura para ver los valores reales del hardware.</Notice>}
      {active ? <><ActionButton label="Detener lectura" onPress={stop} secondary /><ActionButton label="Guardar lectura local" onPress={save} /></> : <View style={styles.buttons}><View style={styles.half}><ActionButton label="Acelerómetro" onPress={() => void start('Acelerómetro')} disabled={!available.accelerometer} /></View><View style={styles.half}><ActionButton label="Giroscopio" onPress={() => void start('Giroscopio')} disabled={!available.gyroscope} /></View></View>}
      {error ? <Notice tone="danger">{error}</Notice> : null}</Card>
  </Screen>;
}
// Estilos de las tarjetas de disponibilidad, valores de ejes y botones de selección.
const styles = StyleSheet.create({ sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10 }, cardTitle: { fontSize: 17, fontWeight: '700' }, axisRow: { flexDirection: 'row', gap: 8, marginVertical: 6 }, axis: { flex: 1, minWidth: 0, borderRadius: 13, padding: 12, alignItems: 'center' }, axisLabel: { fontSize: 12, fontWeight: '700' }, axisValue: { fontSize: 19, fontWeight: '800', marginTop: 4 }, unit: { fontSize: 11 }, buttons: { flexDirection: 'row', gap: 8 }, half: { flex: 1 } });

