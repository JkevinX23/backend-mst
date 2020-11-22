import Sequelize, { Model } from 'sequelize'

class Oferta extends Model {
  static init(sequelize) {
    super.init(
      {
        produto_id: Sequelize.INTEGER,
        quantidade: Sequelize.INTEGER,
        valor_unitario: Sequelize.DECIMAL(10, 2),
        validade_oferta_id: Sequelize.INTEGER,
      },
      {
        sequelize,
        tableName: 'oferta',
      },
    )
    return this
  }

  static associate(models) {
    this.belongsToMany(models.Pedido, {
      through: 'oferta_pedidos',
      as: 'pedidos',
      foreignKey: 'oferta_id',
      // otherKey: 'categoria_id',
    })

    this.belongsTo(models.Produtos, {
      foreignKey: 'produto_id',
      as: 'produtos',
    })

    this.belongsTo(models.ValidadeOferta, {
      foreignKey: 'validade_oferta_id',
      as: 'validade',
    })
  }
}

export default Oferta
