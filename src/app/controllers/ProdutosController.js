import * as Yup from 'yup'
import Produtos from '../models/Produtos'

class ProdutosController {
  async store(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().required(),
      descricao: Yup.string().required(),
      imagem_id: Yup.number().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    const { nome, descricao, imagem_id } = req.body

    let transaction
    try {
      transaction = await Produtos.sequelize.transaction()
      const produto = {
        nome,
        descricao,
        imagem_id,
      }
      const end = await Produtos.create(produto, { transaction })
      await transaction.commit()
      return res.json(end)
    } catch (err) {
      console.log(err)
      if (transaction) await transaction.rollback()
      return res.status(409).json({ error: 'Transaction failed' })
    }
  }
}

export default new ProdutosController()
