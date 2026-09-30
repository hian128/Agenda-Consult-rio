import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- Importando o Tailwind novo

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- Ativando o Tailwind no Vite
  ],
})