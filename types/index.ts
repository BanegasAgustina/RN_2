// Tipos compartidos entre pantallas y funciones de almacenamiento local.
/** Categorías persistidas como claves estables en la base de datos. */
export type ActivityType = 'photo' | 'qr' | 'location' | 'sensor';

/** Fila común del historial; los detalles viven en tablas específicas. */
export type ActivityRecord = {
  id: number;
  type_key: ActivityType;
  created_at: string;
  summary: string;
};

/** Valores de un sensor que pueden guardarse manualmente. */
export type SensorMeasurement = {
  sensor: 'Acelerómetro' | 'Giroscopio';
  x: number;
  y: number;
  z: number;
  unit: string;
};

