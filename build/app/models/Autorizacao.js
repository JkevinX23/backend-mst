"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

class Autorizacoes extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        email: _sequelize2.default.STRING,
        usuario_id: _sequelize2.default.STRING,
      },
      {
        sequelize,
      },
    )

    return this
  }

  static associate(models) {
    this.belongsTo(models.TipoUsuarios, {
      foreignKey: 'tipo_id',
      as: 'Tipo',
    })
  }
}

exports. default = Autorizacoes
