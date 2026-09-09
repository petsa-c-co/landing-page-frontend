import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Escucha en todas las interfaces para poder abrir el sitio desde otros
    // dispositivos de la red. Va acá y no solo en el flag --host del script,
    // así vale siempre, se arranque como se arranque.
    host: true,
    // Puerto FIJO, no el 5173 por defecto de Vite. En esta máquina conviven
    // varios proyectos y todos los Vite pelean por el mismo default: sin
    // fijarlo, el segundo que arranca se corre solo a 5174 y el backend deja
    // de reconocer su origen en CORS. `strictPort` hace que falle de entrada
    // en vez de moverse en silencio.
    port: 5173,
    strictPort: true,
    proxy: {
      // El front pega a /api de su propio origen y Vite lo reenvía al backend.
      // Con esto no hay que hardcodear la IP de la máquina en VITE_API_URL ni
      // lidiar con CORS: desde el celular, el navegador ve todo en el mismo
      // origen (mismo host y puerto que la página).
      //
      // 3100 y no 3000: el 3000 lo ocupa el backend de Club Alianza, que corre
      // en paralelo en esta misma máquina.
      "/api": {
        target: "http://localhost:3100",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
