import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Screen, Heading, Card, ActionButton, DataLine, Notice } from '../components/ui';

// Describe el soporte biométrico del teléfono sin leer ni almacenar datos biométricos.
type DeviceBio = { hardware: boolean; enrolled: boolean; methods: string[] };
/** Traduce a español los tipos de autenticación que devuelve el sistema. */
const methodName = (type: LocalAuthentication.AuthenticationType) => type === LocalAuthentication.AuthenticationType.FINGERPRINT ? 'Huella' : type === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION ? 'Reconocimiento facial' : type === LocalAuthentication.AuthenticationType.IRIS ? 'Iris' : 'Otro método';

/** Consulta el soporte y delega la autenticación al diálogo seguro del sistema. */
export default function BiometricScreen() {
  // `device` se carga al abrir la pantalla; `busy` y `message` controlan la solicitud del sistema.
  const [device, setDevice] = useState<DeviceBio | null>(null); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  // No se leen datos biométricos; solo se consulta disponibilidad y configuración del dispositivo.
  useEffect(() => { let mounted = true;
    Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync(), LocalAuthentication.supportedAuthenticationTypesAsync()])
      .then(([hardware, enrolled, methods]) => { if (mounted) setDevice({ hardware, enrolled, methods: methods.map(methodName) }); })
      .catch(() => { if (mounted) setMessage('No se pudo consultar la autenticación local.'); });
    return () => { mounted = false; };
  }, []);
  /** Abre la solicitud de autenticación del sistema y descarta cualquier dato sensible. */
  const authenticate = async () => {
    setBusy(true); setMessage('');
    try {
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Confirmá tu identidad', cancelLabel: 'Cancelar', disableDeviceFallback: true });
      setMessage(result.success ? 'Autenticación completada.' : result.error === 'user_cancel' || result.error === 'system_cancel' || result.error === 'app_cancel' ? 'Autenticación cancelada.' : result.error === 'not_enrolled' ? 'Configurá una huella o un método facial en los ajustes del teléfono.' : 'No se pudo completar la autenticación.');
    } catch { setMessage('La autenticación no está disponible en este momento.'); }
    finally { setBusy(false); }
  };
  return <Screen><Heading title="Biometría" subtitle="SmartLab delega la verificación al sistema operativo y no accede a huellas ni imágenes faciales." />
    <Card><DataLine label="Plataforma" value={Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : Platform.OS} />
      {device ? <><DataLine label="Hardware biométrico" value={device.hardware ? 'Disponible' : 'No disponible'} /><DataLine label="Método configurado" value={device.enrolled ? device.methods.join(', ') || 'Disponible' : 'Ninguno registrado'} /></> : <Notice>Consultando el dispositivo…</Notice>}
      <ActionButton label="Iniciar autenticación" onPress={() => void authenticate()} disabled={!device?.hardware || !device.enrolled} loading={busy} />
      {message ? <Notice tone={message.includes('completada') ? 'success' : 'muted'}>{message}</Notice> : null}
    </Card>
    <Card><Notice>Android usa el diálogo de autenticación del sistema. En iOS, Expo Go no ofrece todas las capacidades de Face ID a las aplicaciones; para comprobar Face ID de forma fiable se requiere una compilación de desarrollo o de distribución. En ambos sistemas, configurá previamente huella o rostro en Ajustes.</Notice></Card>
  </Screen>;
}

