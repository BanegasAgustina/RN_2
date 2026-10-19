import type { SQLiteDatabase } from 'expo-sqlite';

// Centraliza la creación y evolución del esquema local de SmartLab.
/** Versión del esquema persistente para migrar sin borrar datos existentes. */
const DATABASE_VERSION = 1;

/** Inicializa las tablas normalizadas y aplica cambios de esquema de forma transaccional. */
export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;
  // No vuelve a crear tablas si la base ya tiene esta versión o una más nueva.
  if (current >= DATABASE_VERSION) return;

  await db.withExclusiveTransactionAsync(async (tx) => {
    if (current < 1) {
      // La tabla de tipos evita repetir el nombre de una actividad en cada registro.
      await tx.execAsync(`
        CREATE TABLE activity_types (
          id INTEGER PRIMARY KEY NOT NULL,
          type_key TEXT NOT NULL UNIQUE CHECK (type_key IN ('photo','qr','location','sensor')),
          display_name TEXT NOT NULL UNIQUE
        );
        INSERT INTO activity_types (type_key, display_name) VALUES
          ('photo','Fotografía'), ('qr','Código QR'), ('location','Ubicación'), ('sensor','Sensor');
        -- Cada evento guarda su fecha y tipo; los campos particulares se separan abajo.
        CREATE TABLE activity_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          activity_type_id INTEGER NOT NULL REFERENCES activity_types(id) ON DELETE RESTRICT,
          created_at TEXT NOT NULL,
          summary TEXT NOT NULL CHECK (length(summary) <= 500)
        );
        -- La relación 1:1 conserva ruta y metadatos de cada imagen fuera de SQLite.
        CREATE TABLE photos (
          activity_id INTEGER PRIMARY KEY NOT NULL REFERENCES activity_records(id) ON DELETE CASCADE,
          file_uri TEXT NOT NULL,
          width INTEGER,
          height INTEGER
        );
        -- Cada lectura QR se almacena como un registro independiente, sin ejecutar su contenido.
        CREATE TABLE qr_codes (
          activity_id INTEGER PRIMARY KEY NOT NULL REFERENCES activity_records(id) ON DELETE CASCADE,
          content TEXT NOT NULL CHECK (length(content) <= 4096),
          format TEXT NOT NULL
        );
        -- Las coordenadas son columnas escalares; la hora reside en activity_records.
        CREATE TABLE locations (
          activity_id INTEGER PRIMARY KEY NOT NULL REFERENCES activity_records(id) ON DELETE CASCADE,
          latitude REAL NOT NULL CHECK (latitude BETWEEN -90 AND 90),
          longitude REAL NOT NULL CHECK (longitude BETWEEN -180 AND 180),
          accuracy_m REAL CHECK (accuracy_m IS NULL OR accuracy_m >= 0)
        );
        -- Una fila representa una lectura manual de un tipo de sensor y sus tres ejes.
        CREATE TABLE sensor_readings (
          activity_id INTEGER PRIMARY KEY NOT NULL REFERENCES activity_records(id) ON DELETE CASCADE,
          sensor_name TEXT NOT NULL CHECK (sensor_name IN ('Acelerómetro','Giroscopio')),
          x REAL NOT NULL, y REAL NOT NULL, z REAL NOT NULL, unit TEXT NOT NULL
        );
        -- La clave de preferencia identifica una sola configuración editable.
        CREATE TABLE preferences (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL, updated_at TEXT NOT NULL);
        CREATE INDEX idx_activity_created_at ON activity_records(created_at DESC);
        CREATE INDEX idx_activity_type_date ON activity_records(activity_type_id, created_at DESC);
      `);
    }
    await tx.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);
  });
}

