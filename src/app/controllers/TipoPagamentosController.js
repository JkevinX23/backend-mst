import * as Yup from 'yup'
import TipoPagamentos from '../models/TipoPagamento'

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
      transaction = await TipoPagamentos.sequelize.transaction()
      const response = await TipoPagamentos.create({ titulo }, { transaction })
      await transaction.commit()
      return res.json(response)
    } catch (error) {
      console.log(error)
      if (transaction) await transaction.rollback()
      return res.status(409).json({ error: 'Transaction Error' })
    }
  }

  async index(req, res) {
    const tipos = await TipoPagamentos.findAll({
      attributes: { exclude: ['createdAt', 'updateAt'] },
    })
    return res.json(tipos)
  }
}
export default new TipoPagamentoController()
