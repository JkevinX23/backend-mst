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
import ValidadeOfertaController from './app/controllers/ValidadeOfertaController'
import OfertaController from './app/controllers/OfertaController'
import PedidoController from './app/controllers/PedidoController'
import TipoPagamentosController from './app/controllers/TipoPagamentosController'
import adminAuth from './app/middlewares/adminAuth'
import TipoFreteController from './app/controllers/TipoFreteController'

const routes = new Router()
const upload = multer(multerConfig)

routes.post('/administrador', AdministradorController.store)
routes.post('/tipo-usuario', TipoUsuariosController.store)
routes.post('/sessao', SessaoController.store)
routes.post('/cliente', ClienteController.store)

routes.get('/categoria', CategoriaController.index)
routes.get('/tipos', TipoUsuariosController.index)
routes.get('/oferta', OfertaController.index)
routes.post(
  '/imagens',
  [adminAuth, upload.single('file')],
  ImagensController.store,
)
routes.use(authMiddleware)

routes.get('/cliente', ClienteController.index)
routes.get('/produto', ProdutosController.index)
routes.get('/categoria-admin', CategoriaController.index)
routes.get('/administrador', AdministradorController.index)
routes.get('/validade-oferta', ValidadeOfertaController.index)
routes.get('/oferta-admin', OfertaController.index)
routes.get('/tipo-pagamento', TipoPagamentosController.index)
routes.get('/pedido', PedidoController.index)

routes.post('/produto', ProdutosController.store)
routes.post('/pedido', PedidoController.store)
routes.post('/tipo-pagamento', TipoPagamentosController.store)
routes.post('/categoria', CategoriaController.store)
routes.post('/validade-oferta', ValidadeOfertaController.store)
routes.post('/oferta', OfertaController.store)
routes.post('/frete', TipoFreteController.store)

routes.put('/administrador', AdministradorController.update)
routes.put('/categoria', CategoriaController.update)
routes.put('/cliente', ClienteController.update)
routes.put('/validade-oferta', ValidadeOfertaController.update)

routes.get('/cliente/id/:id', ClienteController.show)
routes.get('/administrador/id/:id', AdministradorController.show)
routes.get('/produto/id/:id', ProdutosController.show)
routes.get('/pedido/id/:id', PedidoController.index)
routes.get('/validade-oferta/id/:id', ValidadeOfertaController.show)

export default routes
