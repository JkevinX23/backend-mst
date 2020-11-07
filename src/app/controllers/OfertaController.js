import * as Yup from 'yup'
import Oferta from '../models/Oferta'
// import ValidadeOferta from '../models/ValidadeOferta'
// import Produtos from '../models/Produtos'

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
      return res.status(403).json({ error: 'Permissao negada' })
    }
    const clientes = await Oferta.findAll({
      include: [
        {
          association: 'produtos',
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
          include: {
            association: 'imagem',
            attributes: ['url', 'path'],
          },
        },
        {
          association: 'validade',
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
        },
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'validade_oferta_id'],
      },
    })
    return res.json(clientes)
  }
}

export default new OfertaController()
