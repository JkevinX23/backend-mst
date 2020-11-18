"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _TipoPagamento = require('../models/TipoPagamento'); var _TipoPagamento2 = _interopRequireDefault(_TipoPagamento);

class TipoPagamentoController {
  async store(req, res) {
    const { option } = req
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }

    const schema = Yup.object().shape({
      titulo: Yup.string().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }
    const { titulo } = req.body

    let transaction
    try {
      transaction = await _TipoPagamento2.default.sequelize.transaction()
      const response = await _TipoPagamento2.default.create({ titulo }, { transaction })
      await transaction.commit()
      return res.json(response)
    } catch (error) {
      console.log(error)
      if (transaction) await transaction.rollback()
      return res.status(409).json({ error: 'Transaction Error' })
    }
  }

  async index(req, res) {
    const tipos = await _TipoPagamento2.default.findAll({
      attributes: { exclude: ['createdAt', 'updateAt'] },
    })
    return res.json(tipos)
  }
}
exports. default = new TipoPagamentoController()
