"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

class ValidadeOferta extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        validade: _sequelize2.default.DATE,
        status: _sequelize2.default.ENUM({
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
exports. default = ValidadeOferta
