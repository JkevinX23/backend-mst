import Sequelize, { Model } from 'sequelize'

class Categoria extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,
        isValid: Sequelize.BOOLEAN,
      },
      {
        sequelize,
        // tableName: 'categoria',
      },
    )

    return this
  }

  static associate(models) {
    this.belongsToMany(models.Produtos, {
      through: 'CategoriaProduto',
      foreignKey: 'categoria_id',
      otherKey: 'produto_id',
    })
  }
}

export default Categoria
