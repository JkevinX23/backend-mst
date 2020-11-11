import Sequelize, { Model } from 'sequelize'

class Pedido extends Model {
  static init(sequelize) {
    super.init(
      {
        status: Sequelize.STRING,
        valor_frete: Sequelize.FLOAT,
      },
      {
        sequelize,
        tableName: 'pedidos',
      },
    )
    return this
  }

  static associate(models) {
    this.belongsTo(models.Cliente, {
      foreignKey: 'cliente_id',
      as: 'clientes',
    })

    this.belongsTo(models.Administrador, {
      foreignKey: 'administrador_id',
      as: 'administrador',
    })

    this.belongsTo(models.TipoPagamentos, {
      foreignKey: 'tipo_pagamento_id',
    })
  }
}

export default Pedido
