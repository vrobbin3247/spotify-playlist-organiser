import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    // Make Vite expose environment variables to your client-side code
    define: {
      // Expose specific environment variables you need
      'process.env.VITE_SPOTIFY_CLIENT_ID': JSON.stringify(env.VITE_SPOTIFY_CLIENT_ID),
      'process.env.VITE_SPOTIFY_CLIENT_SECRET': JSON.stringify(env.VITE_SPOTIFY_CLIENT_SECRET)
    }
  }
})