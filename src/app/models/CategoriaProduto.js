import Sequelize, { Model } from 'sequelize'

class CategoriaProduto extends Model {
  static init(sequelize) {
    super.init(
      {
        produto_id: Sequelize.INTEGER,
        categoria_id: Sequelize.INTEGER,
      },
      {
        sequelize,
        tableName: 'categoria_produto',
      },
    )
    return this
  }

  static associate(models) {
    this.belongsTo(models.Categoria, {
      foreignKey: 'categoria_id',
      as: 'Categoria',
    })
    this.belongsTo(models.Produtos, {
      foreignKey: 'produto_id',
      as: 'Produtos',
    })
  }
}

export default CategoriaProduto
