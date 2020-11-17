"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

class OfertaPedido extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        quantidade: _sequelize2.default.INTEGER,
      },
      {
        sequelize,
      },
    )
    return this
  }

  static associate(models) {
    this.belongsTo(models.Oferta, {
      foreignKey: 'oferta_id',
      as: 'oferta',
    })

    this.belongsTo(models.Pedido, {
      foreignKey: 'pedido_id',
      as: 'pedido',
    })
  }
}

exports. default = OfertaPedido
