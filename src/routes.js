import { Router } from 'express'
import multer from 'multer'

import authMiddleware from './app/middlewares/auth'

import multerConfig from './config/multerConfig'

import AdministradorController from './app/controllers/AdministradorController'
import TipoUsuariosController from './app/controllers/TipoUsuarioController'
import SessaoController from './app/controllers/SessaoController'
import ClienteController from './app/controllers/ClienteController'

const routes = new Router()
const upload = multer(multerConfig)

routes.post('/administrador', AdministradorController.store)
routes.post('/tipo-usuario', TipoUsuariosController.store)
routes.post('/sessao', SessaoController.store)
routes.post('/cliente', ClienteController.store)

routes.use(authMiddleware)

export default routes
