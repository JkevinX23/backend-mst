import * as Yup from 'yup'
import Oferta from '../models/Oferta'
import Pedido from '../models/Pedido'

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
    if (option !== 'administrador') {
      const ofertas = await Oferta.findAll({
        include: [
          {
            association: 'produtos',
            attributes: {
              exclude: ['createdAt', 'updatedAt'],
            },
            include: [
              {
                association: 'imagem',
                attributes: ['url', 'path'],
              },
              {
                association: 'categorias',
                attributes: ['id', 'nome'],
              },
            ],
          },
          {
            association: 'validade',
            attributes: {
              exclude: ['createdAt', 'updatedAt'],
            },
            where: {
              status: 'ativa',
            },
            required: true,
          },
        ],
        attributes: {
          exclude: ['updatedAt', 'validade_oferta_id'],
        },
      })
      const response = await Promise.all(
        ofertas.map(async oferta => {
          const pedidos = await Pedido.findAll({
            where: { id: oferta.id, status: ['aberto', 'entregue'] },
          })
          const off = oferta
          const qtd_disponivel = oferta.quantidade - pedidos.length
          return { off, qtd_disponivel }
        }),
      )
      return res.json(response)
    }
    const ofertas = await Oferta.findAll({
      include: [
        {
          association: 'produtos',
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
          include: [
            {
              association: 'imagem',
              attributes: ['url', 'path'],
            },
            {
              association: 'categorias',
              attributes: ['id', 'nome'],
            },
          ],
        },
        {
          association: 'validade',
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
          where: {
            status: 'ativa',
          },
        },
      ],
      attributes: {
        exclude: ['updatedAt', 'validade_oferta_id'],
      },
    })
    const response = await Promise.all(
      ofertas.map(async oferta => {
        const pedidos = await Pedido.findAll({
          where: { id: oferta.id, status: ['aberto', 'entregue'] },
        })
        const off = oferta
        const qtd_disponivel = oferta.quantidade - pedidos.length
        return { off, qtd_disponivel }
      }),
    )
    return res.json(response)
  }
}
export default new OfertaController()
