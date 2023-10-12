import { defineConfig, splitVendorChunkPlugin, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import json5 from '@miyaneee/rollup-plugin-json5'


// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = env.NODE_ENV === "production" 

  return {
    plugins: [
      // Ensure vite can handle react/jsx code
      react(), 
      // Create a relevant vendor chunk for bundling optimization
      splitVendorChunkPlugin(), 
      // Load JSON5 as modules 
      json5()
    ],
    // Add sourcemaps to the production build
    ...(isProd && {build: {sourcemap: true}}),
    // Test configuration for vitest
    test: {
      environment: 'jsdom', 
    },
  }
})
