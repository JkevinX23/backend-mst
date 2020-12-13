import Sequelize, { Model } from 'sequelize'

class Produtos extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,
        descricao: Sequelize.STRING,
        itemAtivo: Sequelize.BOOLEAN,
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
      as: 'imagem',
    })
    this.belongsToMany(models.Categoria, {
      through: 'categoria_produto',
      as: 'categorias',
      foreignKey: 'produto_id',
      // otherKey: 'categoria_id',
    })
    this.hasMany(models.Oferta, {
      foreignKey: 'id',
      as: 'oferta',
    })
  }
}

export default Produtos
