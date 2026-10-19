// Usamos las reglas recomendadas por Expo para proyectos React Native.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// Combina las reglas de Expo con exclusiones para archivos de salida generados.
module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
]);
