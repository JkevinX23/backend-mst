import Sequelize, { Model } from 'sequelize'

class CategoriaProduto extends Model {
  static init(sequelize) {
    super.init(
      {
        produto_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
        },
        categoria_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
        },
      },
      {
        sequelize,
        tableName: 'categoria_produto',
      },
    )
    return this
  }

  // static associate(models) {
  //   this.belongsTo(models.Categoria, {
  //     foreignKey: 'categoria_id',
  //     as: 'categoria',
  //   })
  //   this.belongsTo(models.Produtos, {
  //     foreignKey: 'produto_id',
  //     as: 'produto',
  //   })
  // }
}

export default CategoriaProduto
