import Sequelize, { Model } from 'sequelize'

class ValidadeOferta extends Model {
  static init(sequelize) {
    super.init(
      {
        validade: Sequelize.DATE,
        status: Sequelize.ENUM({
          values: ['ativa', 'inativa'],
        }),
      },
      {
        sequelize,
        tableName: 'validade_oferta',
      },
    )
    return this
  }

  static associate(models) {
    this.hasMany(models.Oferta, {
      foreignKey: 'id',
      as: 'ofertas',
    })
  }
}
export default ValidadeOferta
