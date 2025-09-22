import 'dotenv/config'

import cors from 'cors'
import express from 'express'

import Database from './config/Database'
import routes from './routes'

const app = express()
app.use(express.json())

app.use(
  cors({
    origin: process.env.FRONTEND_LOCAL,
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
