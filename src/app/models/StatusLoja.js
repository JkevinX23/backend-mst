import Sequelize, { Model } from 'sequelize'

class StatusLoja extends Model {
  static init(sequelize) {
    super.init(
      {
        is_open: Sequelize.BOOLEAN,
      },
      {
        sequelize,
        tableName: 'status_loja',
      },
    )
    return this
  }
}

export default StatusLoja
