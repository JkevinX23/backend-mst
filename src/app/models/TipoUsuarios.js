import Sequelize, { Model } from 'sequelize'

class TipoUsuarios extends Model {
  static init(sequelize) {
    super.init(
      {
        tipo: Sequelize.STRING,
      },
      {
        sequelize,
      },
    )

    return this
  }
}

export default TipoUsuarios
