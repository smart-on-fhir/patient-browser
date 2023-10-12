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
    plugins: [react(), splitVendorChunkPlugin(), json5()],
    ...(isProd && {build: {sourcemap: true}})
  }
})
