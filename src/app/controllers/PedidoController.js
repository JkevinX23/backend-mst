import * as Yup from 'yup'
import Pedido from '../models/Pedido'
import OfertaPedido from '../models/OfertaPedido'
import Oferta from '../models/Oferta'

const { Op } = require('sequelize')

class PedidoController {
  async store(req, res) {
    const schema = Yup.object().shape({
      ofertas: Yup.array()
        .required()
        .of(
          Yup.object().shape({
            oferta_id: Yup.number().required(),
            quantidade: Yup.number().positive().integer().required(),
          }),
        ),
      cliente_id: Yup.number().integer().positive(),
      tipo_pagamento_id: Yup.number().integer().positive().required(),
      status: Yup.string().test(
        'Teste-Status',
        'Status deve ser aberto, entregue, cancelado',
        value =>
          value === 'aberto' ||
          value === 'entregue' ||
          value === 'cancelado' ||
          !value,
      ),
      valor_frete: Yup.number().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.st // objPedido.status = status
      // objPedido.cliente_id = cliente_idatus(400).json({ error: 'Validation fails' })
    }

    const { option, usuario_id } = req

    let transaction

    try {
      transaction = await Oferta.sequelize.transaction()

      const ofertas = req.body.ofertas.map(off => ({
        quantidade: off.quantidade,
        id: off.oferta_id,
      }))

      const arrayOfertas = []

      for (const oferta of ofertas) {
        arrayOfertas.push(
          await Oferta.findByPk(
            oferta.id,
            { plain: true, raw: true },
            { transaction },
          ),
        )
      }

      const itensEsgotados = arrayOfertas.filter(
        (off, index) => off.quantidade < ofertas[index].quantidade,
      )
      if (itensEsgotados.length > 0) {
        // throw new Error();
        transaction.rollback()
        return res.json({ itensEsgotados })
      }

      arrayOfertas.forEach((element, index) => {
        element.quantidade -= ofertas[index].quantidade
      })
      console.log(arrayOfertas)

      for (const off of arrayOfertas) {
        await Oferta.update(off, { where: { id: off.id } }, { transaction })
      }

      const objPedido = {}
      const {
        cliente_id,
        tipo_pagamento_id,
        tipo_frete_id,
        status,
        valor_frete,
      } = req.body
      objPedido.tipo_pagamento_id = tipo_pagamento_id
      objPedido.valor_frete = valor_frete
      objPedido.tipo_frete_id = tipo_frete_id

      if (option === 'administrador') {
        if (!cliente_id) {
          throw Error('Client ID é obrigatorio para o administrador')
        }
        if (status) {
          objPedido.status = status
        }
        objPedido.cliente_id = cliente_id
      } else {
        objPedido.client_id = usuario_id
      }

      const pedido = await Pedido.create(objPedido, { transaction })

      const ofertaPedidos = ofertas.map(off => ({
        quantidade: off.quantidade,
        oferta_id: off.id,
        pedido_id: pedido.id,
      }))

      const oferta_pedido = await OfertaPedido.bulkCreate(ofertaPedidos, {
        transaction,
      })
      await transaction.commit()

      return res.json(oferta_pedido)
    } catch (error) {
      console.log(error)
      if (transaction) await transaction.rollback()
      return res.status(409).json({ error: 'Transaction failed' })
    }
  }

  async index(req, res) {
    const pedidos = await Pedido.findAll({
      include: [
        {
          model: Oferta,
          as: 'ofertas',
          through: {
            attributes: ['quantidade'],
          },
          include: [
            {
              association: 'produtos',
              attributes: ['id', 'nome', 'descricao', 'imagem_id'],
              include: [
                {
                  association: 'imagem',
                  attributes: ['url', 'path'],
                },
              ],
            },
          ],
          attributes: {
            exclude: ['updatedAt', 'createdAt', 'quantidade', 'produto_id'],
          },
        },
        {
          association: 'clientes',
          attributes: {
            exclude: ['updatedAt', 'createdAt', 'password_hash'],
          },
          include: [
            {
              association: 'enderecos',
              attributes: {
                exclude: ['updatedAt', 'createdAt'],
              },
            },
          ],
        },
        {
          association: 'administrador',
          attributes: {
            exclude: ['updatedAt', 'createdAt', 'password_hash'],
          },
        },
      ],

      attributes: {
        exclude: ['updatedAt', 'createdAt'],
      },
    })
    return res.json(pedidos)
  }
}

export default new PedidoController()
