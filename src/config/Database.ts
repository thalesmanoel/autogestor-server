import 'dotenv/config'

import mongoose from 'mongoose'

export default class Database {
  static async connect (): Promise<void> {
    const MONGO_URI = process.env.MONGO_URI

    if (!MONGO_URI) {
      throw new Error('❌ MONGO_URI não definida no .env')
    }

    try {
      await mongoose.connect(MONGO_URI)
      console.log('📦 Conectado ao MongoDB')
    } catch (error) {
      console.error('❌ Erro ao conectar ao MongoDB:', error)
      process.exit(1)
    }
  }
}
