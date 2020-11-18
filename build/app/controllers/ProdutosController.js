"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _Categoria = require('../models/Categoria'); var _Categoria2 = _interopRequireDefault(_Categoria);
var _Produtos = require('../models/Produtos'); var _Produtos2 = _interopRequireDefault(_Produtos);

class ProdutosController {
  async store(req, res) {
    const { option } = req
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }

    const schema = Yup.object().shape({
      nome: Yup.string().required(),
      descricao: Yup.string().required(),
      imagem_id: Yup.number().required(),
      categorias: Yup.array().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    const { nome, descricao, imagem_id, categorias } = req.body

    let transaction
    try {
      transaction = await _Produtos2.default.sequelize.transaction()
      const prod = {
        nome,
        descricao,
        imagem_id,
      }

      const produto = await _Produtos2.default.create(prod, { transaction })
      await produto.setCategorias(categorias, { transaction })

      await transaction.commit()
      return res.json(produto)
    } catch (err) {
      console.log(err)
      if (transaction) await transaction.rollback()
      return res.status(409).json({ error: 'Transaction failed' })
    }
  }

  async index(req, res) {
    const { option } = req
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }

    const { pagina = 1, limite = 20 } = req.query

    const produtos = await _Produtos2.default.findAll({
      limit: parseInt(limite, 10),
      offset: (pagina - 1) * limite,
      include: [
        {
          model: _Categoria2.default,
          as: 'categorias',
          through: {
            attributes: [],
          },
        },
      ],
    })
    return res.json({ produtos })
  }
}

exports. default = new ProdutosController()
