import { Router } from 'express'
import multer from 'multer'

import authMiddleware from './app/middlewares/auth'
import multerConfig from './config/multerConfig'

import AdministradorController from './app/controllers/AdministradorController'
import TipoUsuariosController from './app/controllers/TipoUsuarioController'
import SessaoController from './app/controllers/SessaoController'
import ClienteController from './app/controllers/ClienteController'
import ImagensController from './app/controllers/ImagensController'
import ProdutosController from './app/controllers/ProdutosController'
import CategoriaController from './app/controllers/CategoriaController'

const routes = new Router()
const upload = multer(multerConfig)

routes.post('/administrador', AdministradorController.store)
routes.post('/tipo-usuario', TipoUsuariosController.store)
routes.post('/sessao', SessaoController.store)
routes.post('/cliente', ClienteController.store)
routes.post('/produto', ProdutosController.store)
routes.post('/categoria', CategoriaController.store)

routes.get('/administrador', AdministradorController.index)
routes.get('/cliente', ClienteController.index)
routes.get('/produto', ProdutosController.index)

routes.use(authMiddleware)

routes.post('/imagens', upload.single('file'), ImagensController.store)

routes.put('/administrador', AdministradorController.update)

export default routes
