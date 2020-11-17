"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _datefns = require('date-fns');
var _ValidadeOferta = require('../models/ValidadeOferta'); var _ValidadeOferta2 = _interopRequireDefault(_ValidadeOferta);

class ValidadeOfertaController {
  async store(req, res) {
    const { option } = req
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }
    const schema = Yup.object().shape({
      validade: Yup.date().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    let { validade } = req.body

    validade = _datefns.parseISO.call(void 0, validade)

    if (_datefns.isBefore.call(void 0, validade, new Date())) {
      return res.status(401).json({ error: 'Past dates are not permitted' })
    }

    let transaction
    try {
      transaction = await _ValidadeOferta2.default.sequelize.transaction()
      const validadeOfertaObj = {
        validade,
        status: 'ativa',
      }

      const validadeOferta = await _ValidadeOferta2.default.create(validadeOfertaObj, {
        transaction,
      })
      await transaction.commit()
      return res.json(validadeOferta)
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
    const validadeOferta = await _ValidadeOferta2.default.findAll({
      where: { status: 'ativa' },
    })
    return res.json(validadeOferta)
  }

  async update(req, res) {
    const { option } = req
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }
    const schema = Yup.object().shape({
      validade_id: Yup.number().required(),
      status: Yup.string().test(
        'Teste-Status',
        'Status deve ser ativa ou inativa',
        value => value === 'ativa' || value === 'inativa' || !value,
      ),
      validade: Yup.date(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    const { validade_id } = req.body
    const validadeOferta = await _ValidadeOferta2.default.findByPk(validade_id)

    if (!validadeOferta) {
      return res.status(404).json({ error: 'ID inválido' })
    }

    const update = {}
    const { status } = req.body
    let { validade } = req.body

    if (validade) {
      validade = _datefns.parseISO.call(void 0, validade)
      if (_datefns.isBefore.call(void 0, validade, new Date())) {
        return res.status(401).json({ error: 'Past dates are not permitted' })
      }
      update.validade = validade
    }
    if (status) {
      update.status = status
    }

    let transaction
    try {
      transaction = await _ValidadeOferta2.default.sequelize.transaction()
      const { id, validade: v, status: s } = await validadeOferta.update(
        update,
        {
          where: {
            id: validade_id,
          },
        },
        {
          transaction,
        },
      )

      return res.json({
        response: {
          id,
          validade: v,
          status: s,
        },
      })
    } catch (err) {
      console.log(err)
      if (transaction) await transaction.rollback()
      return res.status(409).json({ error: 'Transaction failed' })
    }
  }
}

exports. default = new ValidadeOfertaController()
