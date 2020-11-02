import Sequelize from 'sequelize'
import Administrador from '../app/models/Administrador'
import databaseConfig from '../config/database'

const models = [Administrador]

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
