import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  // Fix for Material-UI v4 + Vite compatibility
  optimizeDeps: {
    include: [
      "@material-ui/core",
      "@material-ui/styles",
      "@material-ui/icons",
      "@material-ui/utils"
    ]
  },

   build: {
    commonjsOptions: {
      include: [/node_modules/]
    },
    esbuild: {
      loader: {
        '.js': 'jsx', // Enabling JSX syntax for .js files
      },
    },
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
