#!/usr/bin/env node

const esbuild = require('esbuild')
const path = require('path')
const { execSync } = require('child_process')

// 🧹 Kill any existing process using port 8082 (reload server)
try {
  execSync('kill -9 $(lsof -ti :8082)', { stdio: 'ignore' })
} catch (e) {
  // Port wasn't in use — that's fine
}

// ✅ Entry points
const entryPoints = ['application.js']

// ✅ Absolute paths to watch
const watchDirectories = [
  path.join(process.cwd(), 'app/javascript'),
  path.join(process.cwd(), 'app/views'),
  path.join(process.cwd(), 'app/assets/stylesheets'),
]

// ✅ ESBuild base config
const config = {
  absWorkingDir: path.join(process.cwd(), 'app/javascript'),
  bundle: true,
  entryPoints: entryPoints,
  outdir: path.join(process.cwd(), 'app/assets/builds'),
  sourcemap: true,
}

async function rebuild() {
  const chokidar = require('chokidar')
  const http = require('http')
  const clients = []

  // 🛰️ Create live reload server
  http
    .createServer((req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        Connection: 'keep-alive',
      })
      res.write('\n') // Keeps connection open for EventSource
      clients.push(res)
    })
    .listen(8082, () => {
      console.log('📡 Reload server running at http://localhost:8082')
    })

  // 🔁 Watch-ready ESBuild context
  const ctx = await esbuild.context({
    ...config,
    banner: {
      js: ' (() => new EventSource("http://localhost:8082").onmessage = () => location.reload())();',
    },
  })

  // 🧹 Clean exit on Ctrl+C
  process.on('SIGINT', async () => {
    console.log('\n🛑 Stopping watcher...')
    await ctx.dispose()
    process.exit()
  })

  // 👁️ Watch for changes
  chokidar.watch(watchDirectories).on('all', (event, changedPath) => {
    console.log(`[WATCH] ${event} at ${changedPath}`)

    if (changedPath.includes('javascript')) {
      ctx
        .rebuild()
        .then(() => console.log('✅ JS rebuilt'))
        .catch((err) => console.error('❌ Rebuild failed', err))
    }

    clients.forEach((res) => res.write('data: update\n\n'))
    clients.length = 0
  })
}

// 🏁 Entry point
if (process.argv.includes('--watch')) {
  rebuild()
} else {
  esbuild
    .build({
      ...config,
      minify: process.env.RAILS_ENV === 'production',
    })
    .catch(() => process.exit(1))
}
