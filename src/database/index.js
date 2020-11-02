import Sequelize from 'sequelize'
import Administrador from '../app/models/Administrador'
import Autorizacao from '../app/models/Autorizacao'
import TipoUsuarios from '../app/models/TipoUsuarios'
import databaseConfig from '../config/database'

const models = [Administrador, TipoUsuarios, Autorizacao]

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
