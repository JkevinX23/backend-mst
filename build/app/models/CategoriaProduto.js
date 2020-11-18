"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

class CategoriaProduto extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        produto_id: _sequelize2.default.INTEGER,
        categoria_id: _sequelize2.default.INTEGER,
      },
      {
        sequelize,
        tableName: 'categoria_produto',
      },
    )
    return this
  }

  // static associate(models) {
  //   this.belongsTo(models.Categoria, {
  //     foreignKey: 'categoria_id',
  //     as: 'categoria',
  //   })
  //   this.belongsTo(models.Produtos, {
  //     foreignKey: 'produto_id',
  //     as: 'produto',
  //   })
  // }
}

exports. default = CategoriaProduto
