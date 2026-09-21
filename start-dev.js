import { createServer } from 'vite'
import react from '@vitejs/plugin-react'

async function start() {
  const server = await createServer({
    configFile: false,
    root: process.cwd(),
    plugins: [react()],
    server: {
      port: 5173,
      host: '127.0.0.1',
    },
  })
  await server.listen()
  server.printUrls()
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
