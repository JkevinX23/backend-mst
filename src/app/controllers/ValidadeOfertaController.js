import * as Yup from 'yup'
import { parseISO, isBefore } from 'date-fns'
import ValidadeOferta from '../models/ValidadeOferta'

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

    validade = parseISO(validade)

    if (isBefore(validade, new Date())) {
      return res.status(401).json({ error: 'Past dates are not permitted' })
    }

    let transaction
    try {
      transaction = await ValidadeOferta.sequelize.transaction()
      const validadeOfertaObj = {
        validade,
        status: 'ativa',
      }

      const validadeOferta = await ValidadeOferta.create(validadeOfertaObj, {
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
    const validadeOferta = await ValidadeOferta.findAll({
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
    const validadeOferta = await ValidadeOferta.findByPk(validade_id)

    if (!validadeOferta) {
      return res.status(404).json({ error: 'ID inválido' })
    }

    const update = {}
    const { status } = req.body
    let { validade } = req.body

    if (validade) {
      validade = parseISO(validade)
      if (isBefore(validade, new Date())) {
        return res.status(401).json({ error: 'Past dates are not permitted' })
      }
      update.validade = validade
    }
    if (status) {
      update.status = status
    }

    let transaction
    try {
      transaction = await ValidadeOferta.sequelize.transaction()
      const { id, validade: v, status: s } = await validadeOferta.update(
        update,
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

export default new ValidadeOfertaController()
