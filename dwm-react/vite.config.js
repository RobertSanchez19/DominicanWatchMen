import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuracion de Vite. El servidor de desarrollo corre en el puerto 8080.
export default defineConfig({
  plugins: [react()],
  server: { port: 8080, open: true }
})
