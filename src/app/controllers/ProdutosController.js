/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import * as Yup from 'yup'
import Categoria from '../models/Categoria'
import Produtos from '../models/Produtos'
import CategoriaProduto from '../models/CategoriaProduto'

class ProdutosController {
  async store(req, res) {
    const { option } = req
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }

    const schema = Yup.object().shape({
      nome: Yup.string().required(),
      descricao: Yup.string(),
      imagem_id: Yup.number(),
      categorias: Yup.array(),
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
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
        },
        {
          association: 'imagem',
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'id', 'nome'],
          },
        },
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'imagem_id'],
      },
      where: { itemAtivo: true },
    })
    return res.json({ produtos })
  }

  async show(req, res) {
    const { option } = req
    const { id } = req.params
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }

    const produtos = await Produtos.findOne({
      where: {
        id,
        itemAtivo: true,
      },
      include: [
        {
          model: Categoria,
          as: 'categorias',
          through: {
            attributes: [],
          },
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
        },
        {
          association: 'imagem',
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'id', 'nome'],
          },
        },
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'imagem_id'],
      },
    })
    if (!produtos) {
      return res.json({ error: 'not found' })
    }
    return res.json(produtos)
  }

  async update(req, res) {
    const { option } = req
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }
    const schema = Yup.object().shape({
      id: Yup.number().integer().positive(),
      nome: Yup.string(),
      descricao: Yup.string(),
      imagem_id: Yup.number(),
      categorias: Yup.array(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }
    const { id, nome, descricao, imagem_id, categorias } = req.body

    let resultado
    let transaction

    try {
      transaction = await Produtos.sequelize.transaction()
      resultado = await Produtos.update(
        {
          nome,
          descricao,
          imagem_id,
        },
        { where: { id } },
        { transaction },
      ).then(function f() {
        return Produtos.findByPk(id, { transaction })
      })
      if (categorias) {
        await CategoriaProduto.destroy({
          where: {
            produto_id: id,
          },
          transaction,
        })
        const categoriasObj = categorias.map(elem => ({
          produto_id: req.body.id,
          categoria_id: elem,
        }))
        for (const cat of categoriasObj) {
          await CategoriaProduto.create(cat, { transaction })
        }
      }

      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      return res.json({ error: 'falha' })
    }

    return res.json({ id })
  }

  async delete(req, res) {
    const { option } = req
    const { id } = req.params
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }

    const itemAtivo = false

    try {
      await Produtos.update({ itemAtivo }, { where: { id } })
    } catch (err) {
      return res.json({ error: 'falha' })
    }
    return res.json({ success: `deletado produto de id ${id}` })
  }
}

export default new ProdutosController()
