import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'axios',
      'react-router-dom',
      'react-redux',
      '@reduxjs/toolkit',
      'dayjs',
      'formik',
      'yup',
      'framer-motion',
      'jwt-decode',
      'recharts',
      'react-icons',
      'lucide-react',
      'react-toastify'
    ],
    exclude: []
  },
  server: {
    proxy: {
      '/products': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/services': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/users': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/service_requests': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
