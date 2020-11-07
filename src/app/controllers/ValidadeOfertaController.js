import * as Yup from 'yup'
import {
  startOfHour,
  parseISO,
  isBefore,
  format,
  subHours,
  isAfter,
} from 'date-fns'
import ValidadeOferta from '../models/ValidadeOferta'

class CategoriaController {
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
      console.log('aqui')
      const validadeOfertaObj = {
        validade,
        status: 'ativa',
      }

      const validadeOferta = await ValidadeOferta.create(validadeOfertaObj, {
        transaction,
      })
      console.log(validadeOferta)
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
}

export default new CategoriaController()
