"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

var _bcryptjs = require('bcryptjs'); var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

class Administrador extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        nome: _sequelize2.default.STRING,
        email: _sequelize2.default.STRING,
        password_hash: _sequelize2.default.STRING,
        password: _sequelize2.default.VIRTUAL,
      },

      {
        sequelize,
        tableName: 'Administradores',
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
}

exports. default = Administrador
