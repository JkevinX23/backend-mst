import * as Yup from 'yup'
import Categoria from '../models/Categoria'

class CategoriaController {
  async store(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    const { nome } = req.body

    let transaction
    try {
      transaction = await Categoria.sequelize.transaction()
      const categoria = {
        nome,
      }
      const end = await Categoria.create(categoria, { transaction })
      await transaction.commit()
      return res.json(end)
    } catch (err) {
      console.log(err)
      if (transaction) await transaction.rollback()
      return res.status(409).json({ error: 'Transaction failed' })
    }
  }
}

export default new CategoriaController()
