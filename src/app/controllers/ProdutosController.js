import * as Yup from 'yup'
import Categoria from '../models/Categoria'
import Produtos from '../models/Produtos'

class ProdutosController {
  async store(req, res) {
    const { option } = req
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }

    const schema = Yup.object().shape({
      nome: Yup.string().required(),
      descricao: Yup.string().required(),
      imagem_id: Yup.number().required(),
      categorias: Yup.array().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    const { nome, descricao, imagem_id, categorias } = req.body

    let transaction
    try {
      transaction = await Produtos.sequelize.transaction()
      const prod = {
        nome,
        descricao,
        imagem_id,
      }

      const produto = await Produtos.create(prod, { transaction })
      await produto.setCategorias(categorias, { transaction })

      await transaction.commit()
      return res.json(produto)
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

    const { pagina = 1, limite = 20 } = req.query

    const produtos = await Produtos.findAll({
      limit: parseInt(limite, 10),
      offset: (pagina - 1) * limite,
      include: [
        {
          model: Categoria,
          as: 'categorias',
          through: {
            attributes: [],
          },
        },
      ],
    })
    return res.json({ produtos })
  }
}

export default new ProdutosController()
