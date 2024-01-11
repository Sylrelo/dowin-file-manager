import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
// import { RollupDynamicImportVarsOptions } from 'vite'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
  ],
  server: {
    port: 8000
  },
  base: "./"
})
