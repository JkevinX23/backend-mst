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
        // tableName: 'produtos',
      },
    )
    return this
  }

  static associate(models) {
    this.belongsTo(models.Imagens, {
      foreignKey: 'imagem_id',
      as: 'Imagem',
    })
  }
}

export default Produtos
