import Sequelize from 'sequelize'
import Administrador from '../app/models/Administrador'
import Autorizacao from '../app/models/Autorizacao'
import Cliente from '../app/models/Cliente'
import Enderecos from '../app/models/Enderecos'
import Imagens from '../app/models/Imagens'
import TipoUsuarios from '../app/models/TipoUsuarios'
import Produtos from '../app/models/Produtos'
import Categoria from '../app/models/Categoria'
import CategoriaProduto from '../app/models/CategoriaProduto'
import databaseConfig from '../config/database'
import ValidadeOferta from '../app/models/ValidadeOferta'
import Oferta from '../app/models/Oferta'
import TipoPagamento from '../app/models/TipoPagamento'
import Pedido from '../app/models/Pedido'
import OfertaPedido from '../app/models/OfertaPedido'

const models = [
  Administrador,
  TipoUsuarios,
  Autorizacao,
  Enderecos,
  Cliente,
  Imagens,
  Produtos,
  Categoria,
  CategoriaProduto,
  ValidadeOferta,
  Oferta,
  TipoPagamento,
  Pedido,
  OfertaPedido,
]

class Database {
  constructor() {
    this.init()
  }

  init() {
    this.connection = new Sequelize(databaseConfig)

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models))
  }
}

export default new Database()
