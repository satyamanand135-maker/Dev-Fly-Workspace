import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-oxc' // Update this import

export default defineConfig({
  plugins: [react()],
})