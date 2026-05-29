import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build-Zeit-Umgebungsvariable (gesetzt im GitHub-Actions-Workflow).
declare const process: { env: Record<string, string | undefined> }

export default defineConfig({
  plugins: [react()],
  // Basis-Pfad: lokal & auf Vercel "/", auf GitHub Pages "/ratealesson/".
  // Wird im Deploy-Workflow über die Umgebungsvariable VITE_BASE gesetzt.
  base: process.env.VITE_BASE ?? '/',
  server: {
    port: 5173,
    host: true,
  },
})
