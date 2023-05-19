import multipart from '@fastify/multipart'
import publicFolder from '@fastify/static'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import fastify from 'fastify'

import { resolve } from 'node:path'
import 'dotenv/config'

import { memoriesRoutes } from './routes/memories'
import { uploadRoutes } from './routes/upload'
import { authRoutes } from './routes/auth'

const app = fastify()

app.register(multipart)
app.register(publicFolder, {
  root: resolve(__dirname, '../uploads'),
  prefix: '/uploads'
})
app.register(cors, {
  origin: true
})
app.register(jwt, {
  secret: 'spacetime'
})

app.register(memoriesRoutes)
app.register(authRoutes)
app.register(uploadRoutes)

app
  .listen({
    port: 3333,
    host: '0.0.0.0'
  })
  .then(() => {
    console.log('HTTP server running on http://localhost:3333')
  })
