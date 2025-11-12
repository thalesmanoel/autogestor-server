import 'dotenv/config'
import './queues/OrderDeadlineQueue'

import cors from 'cors'
import express from 'express'

import Database from './config/Database'
import routes from './routes'

const app = express()
app.use(express.json())

const allowedOrigins = process.env.FRONTEND_LOCAL?.split(',') || []

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Origem não permitida pelo CORS'))
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

Database.connect()

const PORT = Number(process.env.PORT) || 3000

app.use('/', routes)

app.get('/', (_req, res) => {
  res.send('API rodando 🚀')
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
