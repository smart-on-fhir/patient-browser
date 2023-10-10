import { defineConfig, splitVendorChunkPlugin, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'


// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  console.log(env.NODE_ENV)
  const isProd = env.NODE_ENV === "production" 

  console.log({
    plugins: [react(), splitVendorChunkPlugin()],
    ...(isProd && {build: {sourcemap: true}})
  })
  return {
    plugins: [react(), splitVendorChunkPlugin()],
    ...(isProd && {build: {sourcemap: true}})
  }
})
