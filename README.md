# SmartLab

Aplicación académica móvil creada con React Native, Expo Go y TypeScript. SmartLab permite explorar capacidades del teléfono y guardar de forma local fotografías, lecturas QR, ubicaciones y mediciones de sensores.

## Objetivo general

Demostrar el acceso responsable a cámara, GPS, acelerómetro, giroscopio y autenticación biométrica, integrando una interfaz accesible con una base SQLite relacional persistente.

## Objetivos específicos

- Solicitar permisos únicamente cuando la persona activa una herramienta.
- Mostrar los datos capturados y dejar el guardado bajo control del usuario.
- Persistir el historial y las preferencias en SQLite.
- Separar interfaz, servicios de dispositivo, consultas SQL y tema visual.
- Explicar el esquema relacional y las formas normales con ejemplos.

## Tecnologías

- Expo SDK 58, React Native 0.88 y TypeScript 6.
- Expo Router para rutas y pestañas.
- `expo-camera` para fotografías y lectura QR.
- `expo-file-system` para copiar imágenes a Documentos de la aplicación.
- `expo-location` para consultas de ubicación en primer plano.
- `expo-sensors` para acelerómetro y giroscopio.
- `expo-local-authentication` para delegar biometría al sistema operativo.
- `expo-sqlite` para el historial y preferencias persistentes.
- React Context para gestionar el tema.

React Hook Form y Zod no se agregaron: la aplicación no contiene formularios de edición de datos. La búsqueda y los filtros del historial son controles simples, y las entradas que sí requieren validación (QR, coordenadas y sensores) se verifican en el servicio de base local. Así se evita sumar dependencias que no aportan una función real.

## Requisitos previos

- Windows 10/11.
- Node.js 22.13 o posterior (el proyecto fue inicializado con Node 24.14.1).
- npm y Expo Go instalado en un teléfono Android o iPhone.
- Teléfono y computadora conectados a la misma red para la conexión LAN. Expo CLI también permite cambiar a un túnel si la red local lo requiere.

## Ejecutar en Windows con Expo Go

Desde PowerShell:

```powershell
cd "C:\Users\tomat\OneDrive\Escritorio\RN2"
npm install
npx expo start
```

Abrí Expo Go en el teléfono y escaneá el QR que muestra Metro. En iPhone, usá la cámara del sistema si Expo Go no abre directamente el enlace. Para detener Metro, presioná `Ctrl+C` en la terminal.

Comprobaciones disponibles:

```powershell
npm run typecheck
npm run lint
npx expo-doctor
npx expo export --platform android
```

El proyecto tiene una carpeta `.git` creada por el inicializador de Expo. No se creó ningún commit. Para revisar cambios usá `git status` y `git diff`.

## Estructura

```text
app/                 Rutas, pantallas y navegación Expo Router
components/           Componentes visuales compartidos
constants/            Tokens de diseño y constantes
context/              Preferencia y tema global
database/             Migraciones y operaciones SQLite
types/                Tipos de actividad y medición
docs/                 Guía para exposición académica
assets/               Iconos y recursos del template Expo
```

Las rutas principales están en `app/(tabs)/`; las herramientas y el detalle de actividad se encuentran en `app/`.

## Funcionalidades

- **Inicio:** accesos a cámara, QR, GPS, sensores y biometría.
- **Cámara:** pide permiso al entrar; captura una vista previa y permite descartarla o copiarla al directorio persistente privado de la aplicación. SQLite conserva la ruta y resolución, no el contenido binario.
- **QR:** solicita permiso, acepta solo QR, bloquea eventos duplicados de la sesión y guarda el texto leído. Los enlaces se muestran como texto y nunca se abren automáticamente.
- **Ubicación:** pide permiso en primer plano al consultar, muestra latitud, longitud, precisión y hora. El guardado requiere una segunda acción explícita.
- **Sensores:** consulta disponibilidad, permite alternar entre acelerómetro y giroscopio, actualiza cada 250 ms, muestra X/Y/Z y permite guardar una medición manual. La escucha se quita al salir de la pantalla.
- **Biometría:** consulta hardware y métodos configurados, y abre el diálogo del sistema. SmartLab no obtiene ni almacena datos biométricos.
- **Historial:** busca y filtra, presenta fecha y detalle de cada registro, y confirma antes de eliminar.
- **Configuración:** permite tema claro, oscuro o del sistema y guarda la elección en SQLite.

## Permisos y privacidad

La cámara se solicita desde Cámara o QR; la ubicación se consulta solo en primer plano y bajo demanda; el acceso a movimiento se utiliza únicamente durante la lectura de sensores; la biometría se delega al sistema. No se pide micrófono, ubicación de fondo, contactos ni acceso a Internet para las funciones principales.

Expo Go incluye los módulos Expo instalados según la documentación de SDK 58. Face ID de iOS tiene una limitación: Expo Go no puede probarlo; se necesita una compilación de desarrollo. Huella Android y Touch ID/Face ID en una compilación propia deben probarse en un dispositivo compatible. El hardware real no se probó en esta computadora.

Los archivos y la base SQLite viven en el espacio privado de la aplicación. No se implementó cifrado SQLCipher porque no está disponible en Expo Go. Desinstalar la aplicación elimina sus datos locales; no existe sincronización ni copia remota.

## Base de datos y normalización

`smartlab.db` se inicializa una sola vez mediante `SQLiteProvider`. `database/migrations.ts` consulta `PRAGMA user_version`, activa las claves foráneas y aplica la versión 1 en una transacción; nunca borra ni recrea el archivo de base de datos. Las escrituras usan parámetros (`?`) y los detalles se guardan junto con su registro común en transacciones.

| Tabla | Campos principales | Relación |
| --- | --- | --- |
| `activity_types` | `id`, `type_key`, `display_name` | Catálogo de categorías, una fila por tipo |
| `activity_records` | `id`, `activity_type_id`, `created_at`, `summary` | Muchos registros pertenecen a un tipo |
| `photos` | `activity_id`, `file_uri`, `width`, `height` | Detalle 1:1 con un registro |
| `qr_codes` | `activity_id`, `content`, `format` | Detalle 1:1 con un registro |
| `locations` | `activity_id`, `latitude`, `longitude`, `accuracy_m` | Detalle 1:1 con un registro |
| `sensor_readings` | `activity_id`, `sensor_name`, `x`, `y`, `z`, `unit` | Detalle 1:1 con un registro |
| `preferences` | `key`, `value`, `updated_at` | Preferencias clave/valor, sin relación con actividades |

Las tablas de detalle usan la clave primaria del registro también como clave foránea. El borrado del evento elimina sus detalles en cascada; para fotografías también intenta quitar el archivo privado asociado.

### 1FN

Cada columna contiene un único valor escalar. Por ejemplo, ubicación guarda latitud y longitud en dos columnas reales y un sensor guarda X, Y y Z en columnas numéricas separadas; no se almacenan listas separadas por comas.

### 2FN

Cada tabla tiene una clave primaria de una columna (o usa `activity_id` como única clave del detalle 1:1), por lo que cada atributo no clave depende de toda la clave. Por ejemplo, `sensor_name`, `x`, `y`, `z` y `unit` dependen de la medición identificada por `activity_id`.

### 3FN

Los datos descriptivos de una categoría están en `activity_types`, no repetidos en todos los registros. `activity_records.activity_type_id` apunta al catálogo; el resumen, fecha y detalles dependen del identificador del evento, sin depender de otra columna no clave. Las preferencias no se repiten dentro de cada actividad.

## Pruebas y límites

En esta sesión finalizaron sin errores `npm run typecheck`, `npm run lint`, `npx expo install --check`, `npx expo-doctor` (20/20 comprobaciones), y `npx expo export --platform android`. También se ejecutó el SQL inicial en SQLite y se comprobó la clave foránea, el guardado y borrado en cascada de un QR, y el rechazo de una ubicación inválida. No hay una suite de pruebas automatizadas preexistente.

La auditoría de npm informó 27 avisos (8 moderados, 19 altos) en dependencias transitivas de la cadena Expo/Metro. `npm audit fix` aplicó nueve actualizaciones dentro de rangos compatibles, pero el informe siguió mostrando los avisos; la propuesta forzada de npm implicaría degradar Expo a una versión principal anterior. No se aplicó ese cambio forzado. Conviene volver a ejecutar `npm audit` cuando Expo publique correcciones compatibles.

Las APIs de cámara, QR, GPS, acelerómetro, giroscopio y biometría requieren pruebas con hardware real y permisos del sistema. Ningún hardware se probó desde esta computadora. Face ID en iOS requiere una compilación de desarrollo; compilar iOS localmente requiere macOS o puede hacerse con EAS.

## Guía para la presentación oral

La guía paso a paso está en [`docs/guia-exposicion.md`](docs/guia-exposicion.md) e incluye el recorrido de datos desde las pantallas hasta los servicios y las tablas SQLite.

## Referencias oficiales

- [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/)
- [Expo Router](https://docs.expo.dev/versions/v58.0.0/sdk/router/)
- [Camera](https://docs.expo.dev/versions/v58.0.0/sdk/camera/)
- [Location](https://docs.expo.dev/versions/v58.0.0/sdk/location/)
- [Sensors](https://docs.expo.dev/versions/v58.0.0/sdk/sensors/)
- [Local Authentication](https://docs.expo.dev/versions/v58.0.0/sdk/local-authentication/)
- [SQLite](https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/)
- [FileSystem](https://docs.expo.dev/versions/v58.0.0/sdk/filesystem/)
- [Expo permissions](https://docs.expo.dev/guides/permissions/)
