"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _Administrador = require('../app/models/Administrador'); var _Administrador2 = _interopRequireDefault(_Administrador);
var _Autorizacao = require('../app/models/Autorizacao'); var _Autorizacao2 = _interopRequireDefault(_Autorizacao);
var _Cliente = require('../app/models/Cliente'); var _Cliente2 = _interopRequireDefault(_Cliente);
var _Enderecos = require('../app/models/Enderecos'); var _Enderecos2 = _interopRequireDefault(_Enderecos);
var _Imagens = require('../app/models/Imagens'); var _Imagens2 = _interopRequireDefault(_Imagens);
var _TipoUsuarios = require('../app/models/TipoUsuarios'); var _TipoUsuarios2 = _interopRequireDefault(_TipoUsuarios);
var _Produtos = require('../app/models/Produtos'); var _Produtos2 = _interopRequireDefault(_Produtos);
var _Categoria = require('../app/models/Categoria'); var _Categoria2 = _interopRequireDefault(_Categoria);
var _CategoriaProduto = require('../app/models/CategoriaProduto'); var _CategoriaProduto2 = _interopRequireDefault(_CategoriaProduto);
var _database = require('../config/database'); var _database2 = _interopRequireDefault(_database);
var _ValidadeOferta = require('../app/models/ValidadeOferta'); var _ValidadeOferta2 = _interopRequireDefault(_ValidadeOferta);
var _Oferta = require('../app/models/Oferta'); var _Oferta2 = _interopRequireDefault(_Oferta);
var _TipoPagamento = require('../app/models/TipoPagamento'); var _TipoPagamento2 = _interopRequireDefault(_TipoPagamento);
var _Pedido = require('../app/models/Pedido'); var _Pedido2 = _interopRequireDefault(_Pedido);
var _OfertaPedido = require('../app/models/OfertaPedido'); var _OfertaPedido2 = _interopRequireDefault(_OfertaPedido);

const models = [
  _Administrador2.default,
  _TipoUsuarios2.default,
  _Autorizacao2.default,
  _Enderecos2.default,
  _Cliente2.default,
  _Imagens2.default,
  _Produtos2.default,
  _Categoria2.default,
  _CategoriaProduto2.default,
  _ValidadeOferta2.default,
  _Oferta2.default,
  _TipoPagamento2.default,
  _Pedido2.default,
  _OfertaPedido2.default,
]

class Database {
  constructor() {
    this.init()
  }

  init() {
    this.connection = new (0, _sequelize2.default)(_database2.default)

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models))
  }
}

exports. default = new Database()
