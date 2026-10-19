import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

// Este archivo configura el documento HTML que envuelve las páginas web.
// Se ejecuta en Node al generar la web y no tiene acceso al navegador.
/** Envuelve las rutas web en un documento en español con metadatos y fondo estables. */
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Reinicia el desplazamiento del documento para que las pantallas ScrollView se comporten como en el móvil. */}
        <ScrollViewStyleReset />

        {/* Mantiene un fondo estable mientras se aplica el tema del sistema. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Los metadatos compartidos para la versión web se agregan en este encabezado. */}
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #EDEFF5;
  color-scheme: light dark;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #10131D;
  }
}`;
