"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _multer = require('multer'); var _multer2 = _interopRequireDefault(_multer);

var _auth = require('./app/middlewares/auth'); var _auth2 = _interopRequireDefault(_auth);
var _multerConfig = require('./config/multerConfig'); var _multerConfig2 = _interopRequireDefault(_multerConfig);

var _AdministradorController = require('./app/controllers/AdministradorController'); var _AdministradorController2 = _interopRequireDefault(_AdministradorController);
var _TipoUsuarioController = require('./app/controllers/TipoUsuarioController'); var _TipoUsuarioController2 = _interopRequireDefault(_TipoUsuarioController);
var _SessaoController = require('./app/controllers/SessaoController'); var _SessaoController2 = _interopRequireDefault(_SessaoController);
var _ClienteController = require('./app/controllers/ClienteController'); var _ClienteController2 = _interopRequireDefault(_ClienteController);
var _ImagensController = require('./app/controllers/ImagensController'); var _ImagensController2 = _interopRequireDefault(_ImagensController);
var _ProdutosController = require('./app/controllers/ProdutosController'); var _ProdutosController2 = _interopRequireDefault(_ProdutosController);
var _CategoriaController = require('./app/controllers/CategoriaController'); var _CategoriaController2 = _interopRequireDefault(_CategoriaController);
var _ValidadeOfertaController = require('./app/controllers/ValidadeOfertaController'); var _ValidadeOfertaController2 = _interopRequireDefault(_ValidadeOfertaController);
var _OfertaController = require('./app/controllers/OfertaController'); var _OfertaController2 = _interopRequireDefault(_OfertaController);
var _PedidoController = require('./app/controllers/PedidoController'); var _PedidoController2 = _interopRequireDefault(_PedidoController);
var _TipoPagamentosController = require('./app/controllers/TipoPagamentosController'); var _TipoPagamentosController2 = _interopRequireDefault(_TipoPagamentosController);
var _adminAuth = require('./app/middlewares/adminAuth'); var _adminAuth2 = _interopRequireDefault(_adminAuth);

const routes = new (0, _express.Router)()
const upload = _multer2.default.call(void 0, _multerConfig2.default)

routes.post('/administrador', _AdministradorController2.default.store)
routes.post('/tipo-usuario', _TipoUsuarioController2.default.store)
routes.post('/sessao', _SessaoController2.default.store)
routes.post('/cliente', _ClienteController2.default.store)

routes.get('/categoria', _CategoriaController2.default.index)
routes.get('/tipos', _TipoUsuarioController2.default.index)
routes.get('/oferta', _OfertaController2.default.index)
routes.post(
  '/imagens',
  [_adminAuth2.default, upload.single('file')],
  _ImagensController2.default.store,
)
routes.use(_auth2.default)

routes.get('/cliente', _ClienteController2.default.index)
routes.get('/produto', _ProdutosController2.default.index)
routes.get('/categoria-admin', _CategoriaController2.default.index)
routes.get('/administrador', _AdministradorController2.default.index)
routes.get('/validade-oferta', _ValidadeOfertaController2.default.index)
routes.get('/oferta-admin', _OfertaController2.default.index)
routes.get('/tipo-pagamento', _TipoPagamentosController2.default.index)

routes.post('/produto', _ProdutosController2.default.store)
routes.post('/pedido', _PedidoController2.default.store)
routes.post('/tipo-pagamento', _TipoPagamentosController2.default.store)
routes.post('/categoria', _CategoriaController2.default.store)
routes.post('/validade-oferta', _ValidadeOfertaController2.default.store)
routes.post('/oferta', _OfertaController2.default.store)

routes.put('/administrador', _AdministradorController2.default.update)
routes.put('/categoria', _CategoriaController2.default.update)
routes.put('/cliente', _ClienteController2.default.update)
routes.put('/validade-oferta', _ValidadeOfertaController2.default.update)

exports. default = routes
