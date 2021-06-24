import * as Yup from 'yup'
import { Op } from 'sequelize'
import Oferta from '../models/Oferta'
// import Pedido from '../models/Pedido'
import Categoria from '../models/Categoria'

class OfertaController {
  async store(req, res) {
    const { option } = req
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }

    const schema = Yup.object().shape({
      produto_id: Yup.number().integer().positive().required(),
      quantidade: Yup.number().integer().positive().required(),
      valor_unitario: Yup.number().positive().required(),
      validade_oferta_id: Yup.number().integer().positive().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    const {
      produto_id,
      quantidade,
      valor_unitario,
      validade_oferta_id,
    } = req.body

    let transaction
    try {
      transaction = await Oferta.sequelize.transaction()
      const OfertaObj = {
        produto_id,
        quantidade,
        valor_unitario,
        validade_oferta_id,
      }

      const oferta = await Oferta.create(OfertaObj, { transaction })

      await transaction.commit()
      return res.json(oferta)
    } catch (err) {
      console.log(err)
      if (transaction) await transaction.rollback()
      return res.status(409).json({ error: 'Transaction failed' })
    }
  }

  async index(req, res) {
    const { option } = req
    const { disponibilidade } = req.query
    const where = {
      status: {
        [Op.not]: null,
      },
    }

    const whereQuantidade = {
      quantidade: {
        [Op.not]: null,
      },
    }

    if (option !== 'administrador' || disponibilidade === 'ativa') {
      where.status = 'ativa'
    }

    if (option !== 'administrador') {
      whereQuantidade.quantidade = {
        [Op.gt]: 0,
      }
    }

    const ofertas = await Oferta.findAll({
      include: [
        {
          association: 'produtos',
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'imagem_id'],
          },
          include: [
            {
              association: 'imagem',
              attributes: ['url', 'path'],
            },
            {
              model: Categoria,
              as: 'categorias',
              through: {
                attributes: [],
              },
              attributes: {
                exclude: ['updatedAt', 'createdAt', 'isvalid'],
              },
            },
          ],
        },
        {
          association: 'validade',
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
          where,
          required: true,
        },
      ],
      where: whereQuantidade,
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'validade_oferta_id', 'produto_id'],
      },
    })
    return res.json(ofertas)
  }

  async show(req, res) {
    const { id } = req.params
    const where = {
      id,
    }
    const oferta = await Oferta.findOne({
      where,
      required: true,
      include: [
        {
          association: 'produtos',
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'imagem_id'],
          },
          include: [
            {
              association: 'imagem',
              attributes: ['url', 'path'],
            },
            {
              model: Categoria,
              as: 'categorias',
              through: {
                attributes: [],
              },
              attributes: {
                exclude: ['updatedAt', 'createdAt', 'isvalid'],
              },
            },
          ],
        },
        {
          association: 'validade',
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
        },
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'validade_oferta_id', 'produto_id'],
      },
    })
    if (!oferta) {
      return res.json({ error: 'Oferta não existe' })
    }
    return res.json(oferta)
  }

  async update(req, res) {
    const { option } = req
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }
    const schema = Yup.object().shape({
      id: Yup.number().integer().positive(),
      quantidade: Yup.number(),
      valor_unitario: Yup.number().positive(),
      validade_oferta_id: Yup.number().integer().positive(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    const { id, quantidade, valor_unitario, validade_oferta_id } = req.body

    let resultado
    try {
      resultado = await Oferta.update(
        {
          quantidade,
          valor_unitario,
          validade_oferta_id,
        },
        { where: { id } },
      )
      return res.json(resultado)
    } catch (err) {
      console.log(err)
      return res.status(409).json({ error: 'Transaction failed' })
    }
  }

  async delete(req, res) {
    const { option } = req
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }
    const { id } = req.params

    try {
      const oferta = await Oferta.findOne({ where: parseInt(id, 10) })
      if (!oferta) {
        return res.status(404).json({ error: 'oferta inexistente' })
      }
      await oferta.destroy()
      return res.json({ success: `deletado oferta de id${id}` })
    } catch (err) {
      return res.status(500).json({ error: 'error' })
    }
  }
}
export default new OfertaController()
