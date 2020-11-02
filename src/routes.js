import { Router } from 'express'
import multer from 'multer'
import AdministradorController from './app/controllers/AdministradorController'
import authMiddleware from './app/middlewares/auth'
import multerConfig from './config/multerConfig'

const routes = new Router()
const upload = multer(multerConfig)

routes.post('/administrador', AdministradorController.store)

routes.use(authMiddleware)

export default routes
