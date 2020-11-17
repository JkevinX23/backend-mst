"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _Categoria = require('../models/Categoria'); var _Categoria2 = _interopRequireDefault(_Categoria);

class CategoriaController {
  async store(req, res) {
    const { option } = req
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }
    const schema = Yup.object().shape({
      nome: Yup.string().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    const { nome } = req.body

    const exists = await _Categoria2.default.findOne({ where: { nome } })
    if (exists) {
      return res.status(408).json({ error: 'Categoria já existe' })
    }

    let transaction
    try {
      transaction = await _Categoria2.default.sequelize.transaction()
      const cat = { nome }
      const categoria = await _Categoria2.default.create(cat, { transaction })
      await transaction.commit()
      return res.json(categoria)
    } catch (err) {
      console.log(err)
      if (transaction) await transaction.rollback()
      return res.status(409).json({ error: 'Transaction failed' })
    }
  }

  async index(req, res) {
    const { option } = req
    const { pagina = 1, limite = 20 } = req.query
    if (option !== 'administrador') {
      const categorias = await _Categoria2.default.findAll({
        limit: parseInt(limite, 10),
        offset: (pagina - 1) * limite,
        where: { isvalid: true },
      })
      return res.json(categorias)
    }

    const categorias = await _Categoria2.default.findAll({
      limit: parseInt(limite, 10),
      offset: (pagina - 1) * limite,
    })
    return res.json(categorias)
  }

  async update(req, res) {
    const { option } = req
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }

    const schema = Yup.object().shape({
      nome: Yup.string(),
      isvalid: Yup.boolean(),
      categoria_id: Yup.number().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    const { categoria_id } = req.body

    const categoria = await _Categoria2.default.findByPk(categoria_id)
    if (!categoria) {
      return res.status(404).json({ error: 'Categoria não encontrada' })
    }
    const response = await categoria.update(req.body)
    return res.json(response)
  }
}

exports. default = new CategoriaController()
