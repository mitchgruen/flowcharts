import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function chartsApiPlugin(chartsDir: string): Plugin {
  return {
    name: 'charts-api',
    configureServer(server) {
      server.middlewares.use('/api/charts', (req, res) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const filename = decodeURIComponent(url.pathname).replace(/^\/+/, '')

        if (filename === '') {
          fs.readdir(chartsDir, (err, files) => {
            if (err) {
              res.statusCode = 500
              res.end('Failed to read charts directory')
              return
            }
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                dirName: path.basename(chartsDir),
                files: files.filter((f) => f.endsWith('.mmd')).sort(),
              }),
            )
          })
          return
        }

        if (filename.includes('/') || filename.includes('..') || !filename.endsWith('.mmd')) {
          res.statusCode = 400
          res.end('Invalid filename')
          return
        }

        fs.readFile(path.join(chartsDir, filename), 'utf-8', (err, data) => {
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
