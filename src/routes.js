import { Router } from 'express'
import multer from 'multer'

import authMiddleware from './app/middlewares/auth'
import multerConfig from './config/multerConfig'

import AdministradorController from './app/controllers/AdministradorController'
// import TipoUsuariosController from './app/controllers/TipoUsuarioController'
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
import storeAvailability from './app/middlewares/storeAvailability'
import TipoFreteController from './app/controllers/TipoFreteController'
import EsqueciASenhaController from './app/controllers/EsqueciSenhaController'
import ContadorEstatisticaController from './app/controllers/ContadorEstatisticasController'
import RelatorioPedidoGeralController from './app/controllers/RelatorioPedidoGeralController'
import RelatorioProdutosSemanaisController from './app/controllers/RelatorioProdutosSemanaisController'
import StatusLojaController from './app/controllers/StatusLojaController'
import DebugController from './app/controllers/DebugController'

const routes = new Router()
const upload = multer(multerConfig)

// !No auth routes //

routes.get('/status-loja', StatusLojaController.index)
routes.get('/frete', TipoFreteController.index)
routes.get('/categoria', CategoriaController.index)
// routes.get('/tipos', TipoUsuariosController.index)
routes.get('/oferta', storeAvailability, OfertaController.index)
routes.get('/tipo-pagamento', TipoPagamentosController.index)
routes.get('/oferta/id/:id', OfertaController.show)

routes.post('/administrador', AdministradorController.store)
// routes.post('/tipo-usuario', TipoUsuariosController.store)
routes.post('/sessao', SessaoController.store)
routes.post('/cliente', ClienteController.store)
routes.post('/forget', EsqueciASenhaController.forget)
routes.post('/reset', EsqueciASenhaController.reset)
routes.post(
  '/imagens',
  [adminAuth, upload.single('file')],
  ImagensController.store,
)

// !rotas com autenticação obrigatória //
routes.post('/valida-token', SessaoController.validaToken)
routes.use(authMiddleware)

routes.get('/cliente', ClienteController.index) //! checked
routes.get('/produto', ProdutosController.index) //! checked
routes.get('/categoria-admin', CategoriaController.index) //! checked
routes.get('/administrador', AdministradorController.index) //! checked
routes.get('/validade-oferta', ValidadeOfertaController.index) //! checked
routes.get('/oferta-admin', OfertaController.index) //! checked
routes.get('/pedido', PedidoController.index) //! checked

routes.post('/produto', ProdutosController.store) //! checked
routes.post('/pedido', PedidoController.store) //! checked
routes.post('/tipo-pagamento', TipoPagamentosController.store) //! checked
routes.post('/categoria', CategoriaController.store) //! checked
routes.post('/validade-oferta', ValidadeOfertaController.store) //! checked
routes.post('/oferta', OfertaController.store) //! checked
routes.post('/frete', TipoFreteController.store) //! checked
routes.post('/status-loja', StatusLojaController.store) //! checked

routes.put('/administrador', AdministradorController.update) //! checked
routes.put('/categoria', CategoriaController.update) //! checked
routes.put('/cliente', ClienteController.update) //! checked but need tests
routes.put('/validade-oferta', ValidadeOfertaController.update) //! checked
routes.put('/produto', ProdutosController.update) //! checked
routes.put('/oferta', OfertaController.update) //! checked

routes.get('/estatisticas', ContadorEstatisticaController.show) //! checked
routes.get('/cliente/id/:id', ClienteController.show) //! checked
routes.get('/administrador/id/:id', AdministradorController.show) //! checked
routes.get('/produto/id/:id', ProdutosController.show) //! checked
routes.get('/validade-oferta/id/:id', ValidadeOfertaController.show) //! checked
routes.get(
  '/pedido/cliente_id/:cliente_id/pedido_id/:pedido_id',
  PedidoController.show,
) //! checked

routes.delete('/produto/:id', ProdutosController.delete) //! checked
routes.delete('/categoria/:id', CategoriaController.delete) //! checked
routes.delete('/oferta/:id', OfertaController.delete) //! checked
routes.delete('/pedido/:id', PedidoController.delete) // TODO //! checked
routes.delete('/administrador/:id', AdministradorController.delete) //! checked

routes.get(
  '/relatorio/:validade_oferta_id',
  RelatorioPedidoGeralController.gerar,
) //! checked
routes.get(
  '/relatorio-semanal-produtos/:validade_oferta_id',
  RelatorioProdutosSemanaisController.gerar,
) //! checked

routes.put('/debug', DebugController.update)
routes.get('/debug', DebugController.index)
routes.post('/debug', DebugController.store)
export default routes
