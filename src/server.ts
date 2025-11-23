import 'dotenv/config'
import './queues/OrderDeadlineQueue'

import cors from 'cors'
import express, { NextFunction, Request, Response } from 'express'

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

app.get('/', (_req: Request, res: Response) => {
  res.send('API rodando 🚀')
})

// eslint-disable-next-line unused-imports/no-unused-vars
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('ERRO NO SERVIDOR:', err)

  const status = err.status || 400
  const message = err.message || 'Erro interno no servidor'

  res.status(status).json({
    success: false,
    message
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
