import Sequelize, { Model } from 'sequelize'

class OfertaPedido extends Model {
  static init(sequelize) {
    super.init(
      {
        quantidade: Sequelize.INTEGER,
      },
      {
        sequelize,
        tableName: 'oferta_pedidos',
      },
    )
    return this
  }

  static associate(models) {
    this.belongsTo(models.Oferta, {
      foreignKey: 'oferta_id',
      as: 'oferta',
    })

    this.belongsTo(models.Pedido, {
      foreignKey: 'pedido_id',
      as: 'pedido',
    })
  }
}

export default OfertaPedido
