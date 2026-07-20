import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'sonner',
      'react-xarrows',
      'react-confetti',
      'lucide-react',
      'framer-motion',
      'jwt-decode'
    ]
  }
})
