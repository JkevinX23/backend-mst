import Sequelize, { Model } from 'sequelize'

class TipoFrete extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,
        valor_frete: Sequelize.FLOAT,
      },
      {
        sequelize,
        tableName: 'tipo_frete',
      },
    )
    return this
  }
}

export default TipoFrete
