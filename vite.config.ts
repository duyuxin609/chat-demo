import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // 前端请求 /v1/* 会被转发到 epsilon-openapi 服务
      '/v1': {
        target: process.env.VITE_API_TARGET || 'http://192.168.10.15:8172',
        changeOrigin: true,
      },
    },
  },
})
