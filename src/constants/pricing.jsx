/**
 * Valores iniciales de fábrica.
 * Se usan si no existe configuración previa en LocalStorage.
 */
export const INITIAL_CONFIG = {
  rates: {
    DEV: 85000,
    DISENO: 50000,
    SOPORTE: 60000,
    COPY: 45000
  },
  settings: {
    MIN_DEV_PRICE: 800000,
    URGENCY_MULTIPLIER: 1.4,
    CUSTOM_BUILD_MULTIPLIER: 1.5
  }
};

/**
 * DevGuard - Configuración de Tarifas
 * Definición de constantes para el motor de cálculo.
 */

export const RATES = {
  DEV: 85000,      // Desarrollo en React/Vite
  DISENO: 50000,   // Diseño gráfico (Photoshop/Posters)
  SOPORTE: 60000,  // Soporte técnico y mantenimiento
  COPY: 45000      // Redacción y estrategia de contenido
};

export const CONFIG = {
  MIN_DEV_PRICE: 800000,        // Umbral mínimo de facturación para desarrollo
  URGENCY_MULTIPLIER: 1.4,      // Recargo del 40%
  CUSTOM_BUILD_MULTIPLIER: 1.5  // Recargo del 50% por trabajo desde cero
};