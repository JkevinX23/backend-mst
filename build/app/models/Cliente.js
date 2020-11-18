"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _bcryptjs = require('bcryptjs'); var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

class Cliente extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        nome: _sequelize2.default.STRING,
        email: _sequelize2.default.STRING,
        cpf: _sequelize2.default.INTEGER,
        telefone: _sequelize2.default.INTEGER,
        password_hash: _sequelize2.default.STRING,
        password: _sequelize2.default.VIRTUAL,
      },
      {
        sequelize,
        tableName: 'clientes',
      },
    )

    this.addHook('beforeSave', async admin => {
      if (admin.password) {
        admin.password_hash = await _bcryptjs2.default.hash(admin.password, 8)
      }
    })

    return this
  }

  checkPassword(password) {
    return _bcryptjs2.default.compare(password, this.password_hash)
  }

  static associate(models) {
    this.belongsTo(models.Enderecos, {
      foreignKey: 'endereco_id',
      as: 'enderecos',
    })
  }
}

exports. default = Cliente
