import { Router } from 'express'
import multer from 'multer'

import authMiddleware from './app/middlewares/auth'

import multerConfig from './config/multerConfig'

import AdministradorController from './app/controllers/AdministradorController'
import TipoUsuariosController from './app/controllers/TipoUsuarioController'

const routes = new Router()
const upload = multer(multerConfig)

routes.post('/administrador', AdministradorController.store)
routes.post('/tipo-usuario', TipoUsuariosController.store)

routes.use(authMiddleware)

export default routes
