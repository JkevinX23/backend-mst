import Sequelize, { Model } from 'sequelize'

class Categoria extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,
        isvalid: Sequelize.BOOLEAN,
      },
      {
        sequelize,
        freezeTableName: true,
        tableName: 'categoria',
      },
    )

    return this
  }

  static associate(models) {
    this.belongsToMany(models.Produtos, {
      through: 'CategoriaProduto',
      as: 'produto',
      foreignKey: 'categoria_id',
      otherKey: 'produto_id',
    })
  }
}

export default Categoria
