"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

class Produtos extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        nome: _sequelize2.default.STRING,
        descricao: _sequelize2.default.STRING,
      },
      {
        sequelize,
        tableName: 'produtos',
      },
    )
    return this
  }

  static associate(models) {
    this.belongsTo(models.Imagens, {
      foreignKey: 'imagem_id',
      as: 'imagem',
    })
    this.belongsToMany(models.Categoria, {
      through: 'categoria_produto',
      as: 'categorias',
      foreignKey: 'produto_id',
      // otherKey: 'categoria_id',
    })
    this.hasMany(models.Oferta, {
      foreignKey: 'id',
      as: 'oferta',
    })
  }
}

exports. default = Produtos
