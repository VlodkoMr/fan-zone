import { defineConfig } from 'vite'
import reactPlugin from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [ reactPlugin() ],
  optimizeDeps: {
    include: [ 'react/jsx-runtime' ],
  },
  build: { minify: true, target: 'esnext' },
})


