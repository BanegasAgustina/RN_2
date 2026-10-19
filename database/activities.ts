import type { SQLiteDatabase } from 'expo-sqlite';
import { File } from 'expo-file-system';
import type { ActivityRecord, ActivityType, SensorMeasurement } from '../types';

// Funciones de acceso a SQLite para guardar y consultar datos de las herramientas.
/** Inserta el evento común y obtiene la clave foránea para su tabla de detalle. */
export async function createActivity(db: SQLiteDatabase, type: ActivityType, summary: string): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO activity_records (activity_type_id, created_at, summary) SELECT id, ?, ? FROM activity_types WHERE type_key = ?',
    new Date().toISOString(), summary.slice(0, 500), type,
  );
  if (!result.lastInsertRowId) throw new Error('No se pudo crear el registro del historial.');
  return result.lastInsertRowId;
}

/** Guarda QR y evento en una transacción; el texto se trata como dato no confiable. */
export async function saveQr(db: SQLiteDatabase, content: string, format: string): Promise<void> {
  const safe = content.trim();
  if (!safe || safe.length > 4096) throw new Error('El contenido del QR está vacío o supera el límite permitido.');
  await db.withExclusiveTransactionAsync(async (tx) => {
    const id = await createActivity(tx, 'qr', safe.slice(0, 150));
    await tx.runAsync('INSERT INTO qr_codes (activity_id, content, format) VALUES (?, ?, ?)', id, safe, format.slice(0, 40));
  });
}

/** Persiste ruta permanente y metadatos de una fotografía ya copiada. */
export async function savePhoto(db: SQLiteDatabase, uri: string, width?: number, height?: number): Promise<void> {
  await db.withExclusiveTransactionAsync(async (tx) => {
    const id = await createActivity(tx, 'photo', 'Fotografía guardada');
    await tx.runAsync('INSERT INTO photos (activity_id, file_uri, width, height) VALUES (?, ?, ?, ?)', id, uri, width ?? null, height ?? null);
  });
}

/** Guarda una ubicación solo tras la acción explícita del usuario. */
export async function saveLocation(db: SQLiteDatabase, latitude: number, longitude: number, accuracy: number | null): Promise<void> {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new Error('Las coordenadas no son válidas.');
  await db.withExclusiveTransactionAsync(async (tx) => {
    const id = await createActivity(tx, 'location', `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    await tx.runAsync('INSERT INTO locations (activity_id, latitude, longitude, accuracy_m) VALUES (?, ?, ?, ?)', id, latitude, longitude, accuracy);
  });
}

/** Guarda una única lectura manual de acelerómetro o giroscopio. */
export async function saveSensorReading(db: SQLiteDatabase, measurement: SensorMeasurement): Promise<void> {
  const values = [measurement.x, measurement.y, measurement.z];
  if (!values.every(Number.isFinite)) throw new Error('La medición contiene valores no válidos.');
  await db.withExclusiveTransactionAsync(async (tx) => {
    const id = await createActivity(tx, 'sensor', measurement.sensor);
    await tx.runAsync('INSERT INTO sensor_readings (activity_id, sensor_name, x, y, z, unit) VALUES (?, ?, ?, ?, ?, ?)', id, measurement.sensor, measurement.x, measurement.y, measurement.z, measurement.unit);
  });
}

/** Consulta el historial con filtros parametrizados y resumen del tipo de actividad. */
export async function listActivities(db: SQLiteDatabase, filter: ActivityType | 'all', search: string): Promise<ActivityRecord[]> {
  // Los valores de búsqueda y filtro se envían como parámetros SQL.
  const pattern = `%${search.trim().slice(0, 100)}%`;
  const typeClause = filter === 'all' ? '' : 'AND t.type_key = ?';
  const params = filter === 'all' ? [pattern, pattern] : [pattern, pattern, filter];
  return db.getAllAsync<ActivityRecord>(
    `SELECT a.id, t.type_key, a.created_at, a.summary
     FROM activity_records a JOIN activity_types t ON t.id = a.activity_type_id
     WHERE (a.summary LIKE ? OR t.display_name LIKE ?) ${typeClause}
     ORDER BY a.created_at DESC`, ...params,
  );
}

/** Borra un evento; las FK en cascada eliminan el detalle relacionado. */
export async function deleteActivity(db: SQLiteDatabase, id: number): Promise<void> {
  // Capturamos la ruta antes de borrar en cascada los metadatos de la foto.
  const photo = await db.getFirstAsync<{ file_uri: string }>('SELECT file_uri FROM photos WHERE activity_id = ?', id);
  await db.runAsync('DELETE FROM activity_records WHERE id = ?', id);
  if (photo?.file_uri) {
    // La ruta procede de nuestra propia tabla; el detalle nunca acepta una ruta externa.
    const file = new File(photo.file_uri);
    if (file.exists) file.delete();
  }
}

