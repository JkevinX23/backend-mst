import * as Yup from 'yup'
import Categoria from '../models/Categoria'

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

    const exists = await Categoria.findOne({ where: { nome } })
    if (exists) {
      return res.status(408).json({ error: 'Categoria já existe' })
    }

    let transaction
    try {
      transaction = await Categoria.sequelize.transaction()
      const cat = { nome }
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
    const { pagina = 1, limite = 2147483645 } = req.query
    if (option !== 'administrador') {
      const categorias = await Categoria.findAll({
        limit: parseInt(limite, 10),
        offset: (pagina - 1) * limite,
        where: { isvalid: true },
      })
      return res.json(categorias)
    }

    const categorias = await Categoria.findAll({
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

    const categoria = await Categoria.findByPk(categoria_id)
    if (!categoria) {
      return res.status(404).json({ error: 'Categoria não encontrada' })
    }
    const response = await categoria.update(req.body)
    return res.json(response)
  }

  async delete(req, res) {
    const { option } = req
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }
    const { id } = req.params

    try {
      const categoria = await Categoria.findOne({ where: parseInt(id, 10) })
      if (!categoria) {
        return res.status(404).json({ error: 'categoria inexistente' })
      }
      await categoria.destroy()
      return res.json({ success: `deletado categoria de id ${id}` })
    } catch (err) {
      return res.status(500).json({ error: 'error' })
    }
  }
}

export default new CategoriaController()
