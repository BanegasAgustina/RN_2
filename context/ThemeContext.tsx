import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { ThemeColors, ThemeName, themes } from '../constants/theme';

// Comparte el tema activo en toda la aplicación y guarda la elección en la base local.
// Puede usarse un tema fijo o seguir automáticamente el tema del dispositivo.
type ThemePreference = ThemeName | 'system';
// Valor que los componentes consumen para leer el tema y cambiar la preferencia.
type ThemeContextValue = { preference: ThemePreference; theme: ThemeColors; setPreference: (value: ThemePreference) => Promise<void> };
// Contexto compartido por toda la aplicación.
const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Provee el tema activo y persiste la elección del usuario en SQLite. */
export function ThemeProvider({ children }: React.PropsWithChildren) {
  const db = useSQLiteContext();
  const systemTheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [loaded, setLoaded] = useState(false);

  // La preferencia se lee una vez que la migración creó su tabla.
  useEffect(() => {
    let mounted = true;
    db.getFirstAsync<{ value: string }>('SELECT value FROM preferences WHERE key = ?', 'theme')
      .then((row) => { if (mounted && (row?.value === 'light' || row?.value === 'dark' || row?.value === 'system')) setPreferenceState(row.value); })
      .catch(() => undefined)
      .finally(() => { if (mounted) setLoaded(true); });
    return () => { mounted = false; };
  }, [db]);

  /** Guarda la preferencia sin interrumpir el uso si SQLite informa un error. */
  const setPreference = useCallback(async (value: ThemePreference) => {
    setPreferenceState(value);
    try {
      await db.runAsync('INSERT INTO preferences (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at', 'theme', value, new Date().toISOString());
    } catch {
      // Se mantiene el tema en memoria y la pantalla sigue siendo utilizable.
    }
  }, [db]);
  // Resuelve el tema mostrado: el elegido por el usuario o el modo actual del teléfono.
  const activeName: ThemeName = preference === 'system' ? (systemTheme === 'dark' ? 'dark' : 'light') : preference;
  // Memoriza el valor para evitar propagar cambios cuando la preferencia no varía.
  const value = useMemo(() => ({ preference, theme: themes[activeName], setPreference }), [preference, activeName, setPreference]);
  if (!loaded) return null;
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Devuelve los colores y controles de tema dentro de ThemeProvider. */
export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme debe utilizarse dentro de ThemeProvider.');
  return value;
}

