import * as Yup from 'yup'
import StatusLoja from '../models/StatusLoja'

class DebugController {
  async index(req, res) {
    const tf = await StatusLoja.findAll()
    return res.status(200).json(tf)
  }

  async store(req, res) {
    const tf = await StatusLoja.findAll()

    if (tf.length === 1) {
      return res.status(400).json('já possui')
    }
    const { option } = req
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }

    const schema = Yup.object().shape({
      is_open: Yup.boolean().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    const { is_open } = req.body
    let transaction
    try {
      transaction = await StatusLoja.sequelize.transaction()
      const statuss = {
        is_open,
      }

      const end = await StatusLoja.create(statuss, { transaction })
      await transaction.commit()
      return res.json(end)
    } catch (err) {
      console.log(err)
      if (transaction) await transaction.rollback()
      return res.status(409).json({ error: 'Transaction failed' })
    }
  }

  async update(req, res) {
    const tf = await StatusLoja.findAll()
    tf[0].is_open = !tf[0].is_open
    await tf[0].save()
    console.log(tf)
    return res.json(tf)
  }
}

export default new DebugController()
