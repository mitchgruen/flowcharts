import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function chartsApiPlugin(chartsDir: string): Plugin {
  return {
    name: 'charts-api',
    configureServer(server) {
      server.middlewares.use('/api/charts/test.mmd', (_req, res) => {
        const filePath = path.join(chartsDir, 'test.mmd')
        fs.readFile(filePath, 'utf-8', (err, data) => {
          if (err) {
            res.statusCode = 404
            res.end('Not found')
            return
          }
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.end(data)
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), chartsApiPlugin(env.VITE_CHARTS_DIR)],
  }
})
