import Sequelize, { Model } from 'sequelize'

class Produtos extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,
        descricao: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'produtos',
      },
    )
    return this
  }

  static associate(models) {
    this.belongsTo(models.Imagens, {
      foreignKey: 'imagem_id',
      as: 'Imagem',
    })
    this.belongsToMany(models.Categoria, {
      through: 'CategoriaProduto',
      as: 'categoria',
      foreignKey: 'produto_id',
      otherKey: 'categoria_id',
    })
  }
}

export default Produtos
