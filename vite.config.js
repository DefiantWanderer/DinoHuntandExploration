import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// HTTPS is required for camera, GPS and motion sensors on phones.
export default defineConfig({
  plugins: [basicSsl()],
  server: { host: true, allowedHosts: true }, // allowedHosts lets tunnel URLs through
})
