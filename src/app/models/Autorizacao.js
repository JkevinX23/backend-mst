import Sequelize, { Model } from 'sequelize'

class Autorizacoes extends Model {
  static init(sequelize) {
    super.init(
      {
        email: Sequelize.STRING,
        usuario_id: Sequelize.STRING,
      },
      {
        sequelize,
      },
    )

    return this
  }

  static associate(models) {
    this.belongsTo(models.TipoUsuarios, {
      foreignKey: 'tipo_id',
    })
  }
}

export default Autorizacoes
