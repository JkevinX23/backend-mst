"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

class Pedido extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        status: _sequelize2.default.STRING,
        valor_frete: _sequelize2.default.FLOAT,
      },
      {
        sequelize,
        tableName: 'pedidos',
      },
    )
    return this
  }

  static associate(models) {
    this.belongsTo(models.Cliente, {
      foreignKey: 'cliente_id',
      as: 'clientes',
    })

    this.belongsTo(models.Administrador, {
      foreignKey: 'administrador_id',
      as: 'administrador',
    })

    this.belongsTo(models.TipoPagamentos, {
      foreignKey: 'tipo_pagamento_id',
    })
  }
}

exports. default = Pedido
