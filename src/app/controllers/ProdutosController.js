import * as Yup from 'yup'

import CategoriaProduto from '../models/CategoriaProduto'
import Categoria from '../models/Categoria'
import Produtos from '../models/Produtos'

class ProdutosController {
  async store(req, res) {
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

      const mapProdutos = categorias.map(cat_id => {
        return {
          produto_id: produto.id,
          categoria_id: cat_id,
        }
      })

      await CategoriaProduto.bulkCreate(mapProdutos, {
        transaction,
      })

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
    const produtos = await CategoriaProduto.findAll({
      include: [
        { model: Produtos, as: 'produto' },
        { model: Categoria, as: 'categoria' },
      ],
    })
    return res.json({ produtos })
  }
}

export default new ProdutosController()
