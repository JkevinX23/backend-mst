import 'dotenv/config'
import cron from 'node-cron'
import express from 'express'
import path from 'path'
import cors from 'cors'
import routes from './routes'
import './database'
import ExpirarOfertas from './app/jobs/ExpirarOfertas'

class App {
  constructor() {
    this.server = express()
    this.middlewares()
    this.routes()
    this.test()
  }

  middlewares() {
    this.server.use(cors())
    this.server.use(express.json())
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'data', 'uploads')),
    )
  }

  routes() {
    this.server.use(routes)
  }

  test() {
    cron.schedule('* * * * *', () => ExpirarOfertas.expirar())
  }
}

export default new App().server
