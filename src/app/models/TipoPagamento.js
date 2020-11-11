import Sequelize, { Model } from 'sequelize'

class TipoPagamentos extends Model {
  static init(sequelize) {
    super.init(
      {
        titulo: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'tipo_pagamentos',
      },
    )
    return this
  }
}

export default TipoPagamentos
