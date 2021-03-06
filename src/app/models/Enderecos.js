import Sequelize, { Model } from 'sequelize'

class Enderecos extends Model {
  static init(sequelize) {
    super.init(
      {
        cep: Sequelize.STRING,
        estado: Sequelize.STRING,
        cidade: Sequelize.STRING,
        bairro: Sequelize.STRING,
        logradouro: Sequelize.STRING,
        numero: Sequelize.STRING,
        complemento: Sequelize.STRING,
        referencia: Sequelize.STRING,
      },
      {
        sequelize,
      },
    )
    return this
  }

  static associate(models) {
    this.hasMany(models.Cliente, {
      foreignKey: 'id',
      as: 'user',
    })
  }
}
export default Enderecos
