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
      const cat = {
        nome,
      }
      const categoria = await Categoria.create(cat, { transaction })
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
    if (option !== 'administrador') {
      const categorias = await Categoria.findAll({ where: { isvalid: true } })
      return res.json(categorias)
    }
    const categorias = await Categoria.findAll()
    return res.json(categorias)
  }
}

export default new CategoriaController()
