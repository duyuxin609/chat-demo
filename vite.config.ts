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
      // 部署到自己的环境时，用环境变量 VITE_API_TARGET 指定地址，例如：
      //   VITE_API_TARGET=https://your-openapi-host
      '/v1': {
        target: process.env.VITE_API_TARGET || 'http://localhost:8172',
        changeOrigin: true,
      },
    },
  },
})
