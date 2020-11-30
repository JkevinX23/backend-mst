import * as Yup from 'yup'
import Pedido from '../models/Pedido'
import OfertaPedido from '../models/OfertaPedido'
import Oferta from '../models/Oferta'

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
      tipo_frete_id: Yup.number().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
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
        await transaction.rollback()
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
        exclude: ['updatedAt', 'createdAt', 'cliente_id', 'administrador_id'],
      },
    })
    return res.json(pedidos)
  }

  async show(req, res) {
    const { option, usuario_id } = req
    const { id } = req.params
    if (parseInt(id, 10) !== usuario_id && option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }
    const pedidos = await Pedido.findOne({
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
        exclude: ['updatedAt', 'createdAt', 'cliente_id', 'administrador_id'],
      },
      where: { id_cliente: id },
    })
    return res.json(pedidos)
  }

  async update(req, res) {
    const { option, usuario_id } = req

    /*
            @To Do

    Para option igual a 'Cliente', Faltam validações

    */
    if (option === 'administrador') {
      const schema = Yup.object().shape({
        pedido_id: Yup.number().integer().positive().required(),
        ofertas: Yup.array().of(
          Yup.object().shape({
            oferta_id: Yup.number(),
            quantidade: Yup.number().positive().integer(),
          }),
        ),
        cliente_id: Yup.number().integer().positive(),
        tipo_pagamento_id: Yup.number().integer().positive(),
        status: Yup.string().test(
          'Teste-Status',
          'Status deve ser aberto, entregue, cancelado',
          value =>
            value === 'aberto' ||
            value === 'entregue' ||
            value === 'cancelado' ||
            !value,
        ),
        tipo_frete_id: Yup.number().integer().positive(),
      })

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation fails' })
      }

      const { pedido_id } = req.body
      const pedido = await Pedido.findByPk(pedido_id)
      let transaction
      try {
        transaction = await Pedido.sequelize.transaction()
        const response = await pedido.update(req.body, { transaction })
        await transaction.commit()
        return res.json(response)
      } catch (err) {
        if (transaction) await transaction.rollback()
        console.log(err)
        return res.status(409).json('Transaction Failed')
      }
    }

    if (option === 'cliente') {
      const schema = Yup.object().shape({
        pedido_id: Yup.number().integer().positive().required(),
        ofertas: Yup.array().of(
          Yup.object().shape({
            oferta_id: Yup.number(),
            quantidade: Yup.number().positive().integer(),
          }),
        ),
        tipo_pagamento_id: Yup.number().integer().positive(),
        tipo_frete_id: Yup.number().integer().positive(),
      })

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation fails' })
      }

      const { pedido_id } = req.body
      const pedido = await Pedido.findByPk(pedido_id)
      if (pedido.cliente_id !== usuario_id) {
        return res.status(402).json({ error: 'Permissão negada' })
      }
      let transaction
      try {
        transaction = await Pedido.sequelize.transaction()
        const response = await pedido.update(req.body, { transaction })
        await transaction.commit()
        return res.json(response)
      } catch (err) {
        if (transaction) await transaction.rollback()
        console.log(err)
        return res.status(409).json('Transaction Failed')
      }
    }
    return res.status(401).json({ error: 'Invalid option' })
  }
}

export default new PedidoController()
