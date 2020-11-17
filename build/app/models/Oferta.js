"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

class Oferta extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        produto_id: _sequelize2.default.INTEGER,
        quantidade: _sequelize2.default.INTEGER,
        valor_unitario: _sequelize2.default.DECIMAL(10, 2),
        validade_oferta_id: _sequelize2.default.INTEGER,
      },
      {
        sequelize,
        tableName: 'oferta',
      },
    )
    return this
  }

  static associate(models) {
    this.belongsTo(models.Produtos, {
      foreignKey: 'produto_id',
      as: 'produtos',
    })

    this.belongsTo(models.ValidadeOferta, {
      foreignKey: 'validade_oferta_id',
      as: 'validade',
    })
  }
}

exports. default = Oferta
