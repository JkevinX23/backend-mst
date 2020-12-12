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
    this.belongsToMany(models.Oferta, {
      through: 'oferta_pedidos',
      as: 'ofertas',
      foreignKey: 'pedido_id',
      // otherKey: 'categoria_id',
    })

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
      as: 'pagamento',
    })

    this.belongsTo(models.TipoFrete, {
      foreignKey: 'tipo_frete_id',
      as: 'frete',
    })
  }
}

export default Pedido
