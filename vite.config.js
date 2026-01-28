import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // Esto evita que Vite intente procesar el HMR si hay errores de nulos en el escaneo inicial
    hmr: {
      overlay: false 
    }
  },
  optimizeDeps: {
    // Forzamos a que no intente pre-empaquetar Tailwind como una dependencia JS común
    exclude: ['tailwindcss']
  }
});