import {fileURLToPath, URL} from "node:url"; 
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve:{
    alias:{
      "@" : fileURLToPath(new URL("./src", import.meta.url)),
    }
  },
  server: {
    proxy: {
      '/api/ai': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
      },
      '/api/chat': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
