import * as Yup from 'yup'
import TipoFrete from '../models/TipoFrete'

class TipoFreteController {
  async index(req, res) {
    const tf = await TipoFrete.findAll()
    return res.json(tf)
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().required(),
      valor_frete: Yup.number().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    const { nome, valor_frete } = req.body
    let transaction
    try {
      transaction = await TipoFrete.sequelize.transaction()
      const frete = {
        nome,
        valor_frete,
      }

      const end = await TipoFrete.create(frete, { transaction })
      await transaction.commit()
      return res.json(end)
    } catch (err) {
      console.log(err)
      if (transaction) await transaction.rollback()
      return res.status(409).json({ error: 'Transaction failed' })
    }
  }
}

export default new TipoFreteController()
