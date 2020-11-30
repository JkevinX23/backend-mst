import * as Yup from 'yup'
import { Op } from 'sequelize'
import Oferta from '../models/Oferta'
// import Pedido from '../models/Pedido'
import Categoria from '../models/Categoria'

class OfertaController {
  async store(req, res) {
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
    if (option !== 'administrador' || disponibilidade === 'ativa') {
      where.status = 'ativa'
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
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'validade_oferta_id', 'produto_id'],
      },
    })
    // debater depois // ("quantidade" de oferta é o restante atualmente)

    // const response = await Promise.all(
    //   ofertas.map(async oferta => {
    //     const pedidos = await Pedido.findAll({
    //       where: { id: oferta.id, status: ['aberto', 'entregue'] },
    //     })
    //     const off = oferta
    //     const qtd_disponivel = oferta.quantidade - pedidos.length
    //     return { off, qtd_disponivel }
    //   }),
    // )

    //

    return res.json(ofertas)
  }
}
export default new OfertaController()
