import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { HttpsProxyAgent } from 'https-proxy-agent'

// 千帆 tokenplan/personal 端点需要通过系统代理访问（直连会 401）
const systemProxy = process.env.HTTP_PROXY || process.env.http_proxy || 'http://127.0.0.1:7890'
const httpsAgent = new HttpsProxyAgent(systemProxy)

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
    proxy: {
      '/qianfan-api': {
        target: 'https://qianfan.baidubce.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/qianfan-api/, '/v2/tokenplan/personal'),
        agent: httpsAgent,
      },
    },
  },
})
