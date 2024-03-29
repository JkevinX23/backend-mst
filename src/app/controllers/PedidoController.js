/* eslint-disable no-await-in-loop */
/* eslint "no-restricted-syntax": "off" */
import * as Yup from 'yup'
import Pedido from '../models/Pedido'
import OfertaPedido from '../models/OfertaPedido'
import Oferta from '../models/Oferta'
import ValidadeOferta from '../models/ValidadeOferta'
import StatusLoja from '../models/StatusLoja'

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
          await Oferta.findByPk(oferta.id, {
            plain: true,
            raw: true,
            transaction,
          }),
        )
      }

      const itensEsgotados = arrayOfertas.filter(
        (off, index) => off.quantidade < ofertas[index].quantidade,
      )
      if (itensEsgotados.length > 0) {
        await transaction.rollback()
        return res.status(404).json({ itensEsgotados })
      }

      arrayOfertas.forEach((element, index) => {
        element.quantidade -= ofertas[index].quantidade
      })

      for (const off of arrayOfertas) {
        await Oferta.update(off, { where: { id: off.id }, transaction })
      }

      const objPedido = {}
      const { cliente_id, tipo_pagamento_id, tipo_frete_id, status } = req.body
      objPedido.tipo_pagamento_id = tipo_pagamento_id
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
        objPedido.cliente_id = usuario_id
      }

      const pedido = await Pedido.create(objPedido, { transaction })

      const ofertaPedidos = ofertas.map(off => ({
        quantidade: off.quantidade,
        oferta_id: off.id,
        pedido_id: pedido.id,
      }))

      await OfertaPedido.bulkCreate(ofertaPedidos, {
        transaction,
      })
      await transaction.commit()

      return res.json(pedido)
    } catch (error) {
      console.log(error)
      if (transaction) await transaction.rollback()
      return res.status(409).json({ error: 'Transaction failed' })
    }
  }

  async index(req, res) {
    const { option, usuario_id } = req

    const where = {
      cliente_id: {
        [Op.not]: null,
      },
    }
    if (option !== 'administrador') {
      where.cliente_id = usuario_id
    }
    const { pagina = 1, limite = 2147483645 } = req.query

    const pedidos = await Pedido.findAll({
      limit: parseInt(limite, 10),
      offset: (pagina - 1) * limite,
      where,
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

        {
          association: 'pagamento',
          attributes: {
            exclude: ['updatedAt', 'createdAt'],
          },
        },

        {
          association: 'frete',
          attributes: {
            exclude: ['updatedAt', 'createdAt'],
          },
        },
      ],
      order: [['createdAt', 'DESC']],
      attributes: {
        exclude: ['updatedAt', 'cliente_id', 'administrador_id'],
      },
    }).then(function (result) {
      return JSON.parse(JSON.stringify(result))
    })
    pedidos.forEach(element => {
      let total = 0.0
      element.ofertas.forEach(ele2 => {
        total +=
          parseFloat(ele2.valor_unitario, 10) *
          parseInt(ele2.oferta_pedidos.quantidade, 10)
      })
      total += element.frete.valor_frete

      if (element.status === 'cancelado') {
        total = 0.0
      }
      element.total = total
    })

    return res.json(pedidos)
  }

  async show(req, res) {
    const { option, usuario_id } = req
    const { pedido_id, cliente_id } = req.params

    if (parseInt(cliente_id, 10) !== usuario_id && option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }

    const where = {
      cliente_id,
      id: pedido_id,
    }

    const pedido = await Pedido.findOne({
      where,
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

        {
          association: 'frete',
          attributes: {
            exclude: ['updatedAt', 'createdAt'],
          },
        },

        {
          association: 'pagamento',
          attributes: {
            exclude: ['updatedAt', 'createdAt'],
          },
        },
      ],

      attributes: {
        exclude: ['updatedAt', 'cliente_id', 'administrador_id'],
      },
    }).then(function (result) {
      return JSON.parse(JSON.stringify(result))
    })

    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' })
    let total = 0.0
    pedido.ofertas.forEach(element => {
      total +=
        parseFloat(element.valor_unitario, 10) *
        parseInt(element.oferta_pedidos.quantidade, 10)
    })
    total += pedido.frete.valor_frete
    if (pedido.status === 'cancelado') {
      total = 0.0
    }
    pedido.total = total

    return res.json({ pedido })
  }

  async update(req, res) {
    const { option, usuario_id } = req

    const schema = Yup.object().shape({
      id: Yup.number().integer().positive().required(),
    })
    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' })
    }
    const pedidoId = parseInt(req.params.id, 10)

    if (option === 'administrador') {
      const schemaOff = Yup.object().shape({
        ofertas: Yup.array().of(
          Yup.object().shape({
            oferta_id: Yup.number(),
            quantidade: Yup.number().positive().integer(),
          }),
        ),
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

      if (!(await schemaOff.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation fails' })
      }

      let transaction
      try {
        transaction = await Oferta.sequelize.transaction()

        const pedido = await Pedido.findOne(
          { where: { id: pedidoId } },
          { transaction },
        )
        const ofertaPedido = await OfertaPedido.findAll(
          {
            where: { pedido_id: pedidoId },
          },
          { transaction },
        )

        const ofertas = req.body.ofertas.map(off => ({
          id: off.oferta_id,
          quantidade: off.quantidade,
        }))

        const arrayOfertasFromDb = []

        for (const oferta of ofertas) {
          arrayOfertasFromDb.push(
            await Oferta.findByPk(oferta.id, {
              plain: true,
              raw: true,
              transaction,
            }),
          )
        }

        for (const off of ofertaPedido) {
          const ofer = await Oferta.findOne(
            { where: { id: off.oferta_id } },
            transaction,
          )
          await ofer.increment('quantidade', {
            by: off.quantidade,
            transaction,
          })
          arrayOfertasFromDb.forEach(elem => {
            if (elem.id === off.oferta_id) {
              elem.quantidade += off.quantidade
            }
          })
          await off.destroy({ transaction })
        }

        const itensEsgotados = arrayOfertasFromDb.filter(
          (off, index) => off.quantidade < ofertas[index].quantidade,
        )
        if (itensEsgotados.length > 0) {
          await transaction.rollback()
          return res.status(404).json({ itensEsgotados })
        }

        arrayOfertasFromDb.forEach((element, index) => {
          element.quantidade -= ofertas[index].quantidade
        })

        for (const off of arrayOfertasFromDb) {
          await Oferta.update(off, { where: { id: off.id }, transaction })
        }

        for (const ofertaP of ofertaPedido) {
          await ofertaP.destroy({ transaction })
        }

        const ofertaPedidos = ofertas.map(off => ({
          quantidade: off.quantidade,
          oferta_id: off.id,
          pedido_id: pedido.id,
        }))

        await OfertaPedido.bulkCreate(ofertaPedidos, {
          transaction,
        })
        await transaction.commit()

        return res.json(pedido)
      } catch (error) {
        console.log(error)
        if (transaction) await transaction.rollback()
        return res.status(409).json({ error: 'Transaction failed' })
      }
    }

    if (option === 'cliente') {
      const pedidos = await Pedido.findOne({
        include: [
          {
            association: 'ofertas',
            required: true,
            include: [
              {
                association: 'validade',
                required: true,
              },
            ],
          },
        ],
        required: true,
        where: { id: pedidoId },
      })
      if (parseInt(usuario_id, 10) !== pedidos.cliente_id) {
        return res.status(403).json({ error: 'permissao negada' })
      }
      if (pedidos.ofertas[0].validade.status !== 'ativa') {
        return res.status(403).json({
          error:
            'Não é possivel editar um pedido em que as ofertas já foram expiradas',
        })
      }
      const statusLoja = await StatusLoja.findOne()
      if (!statusLoja.is_open) {
        return res.status(403).json({
          error:
            'não é posssivel cancelar um pedido quando a loja está fechada',
        })
      }

      const schemaOff = Yup.object().shape({
        ofertas: Yup.array().of(
          Yup.object().shape({
            oferta_id: Yup.number(),
            quantidade: Yup.number().positive().integer(),
          }),
        ),
        tipo_pagamento_id: Yup.number().integer().positive(),
        tipo_frete_id: Yup.number().integer().positive(),
      })

      if (!(await schemaOff.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation fails' })
      }

      let transaction
      try {
        transaction = await Oferta.sequelize.transaction()

        const pedido = await Pedido.findOne(
          { where: { id: pedidoId } },
          { transaction },
        )
        const ofertaPedido = await OfertaPedido.findAll(
          {
            where: { pedido_id: pedidoId },
          },
          { transaction },
        )

        const ofertas = req.body.ofertas.map(off => ({
          id: off.oferta_id,
          quantidade: off.quantidade,
        }))

        const arrayOfertasFromDb = []

        for (const oferta of ofertas) {
          arrayOfertasFromDb.push(
            await Oferta.findByPk(oferta.id, {
              plain: true,
              raw: true,
              transaction,
            }),
          )
        }

        for (const off of ofertaPedido) {
          const ofer = await Oferta.findOne(
            { where: { id: off.oferta_id } },
            transaction,
          )
          await ofer.increment('quantidade', {
            by: off.quantidade,
            transaction,
          })
          arrayOfertasFromDb.forEach(elem => {
            if (elem.id === off.oferta_id) {
              elem.quantidade += off.quantidade
            }
          })
          await off.destroy({ transaction })
        }

        const itensEsgotados = arrayOfertasFromDb.filter(
          (off, index) => off.quantidade < ofertas[index].quantidade,
        )
        if (itensEsgotados.length > 0) {
          await transaction.rollback()
          return res.status(404).json({ itensEsgotados })
        }

        arrayOfertasFromDb.forEach((element, index) => {
          element.quantidade -= ofertas[index].quantidade
        })

        for (const off of arrayOfertasFromDb) {
          await Oferta.update(off, { where: { id: off.id }, transaction })
        }

        for (const ofertaP of ofertaPedido) {
          await ofertaP.destroy({ transaction })
        }

        const ofertaPedidos = ofertas.map(off => ({
          quantidade: off.quantidade,
          oferta_id: off.id,
          pedido_id: pedido.id,
        }))

        await OfertaPedido.bulkCreate(ofertaPedidos, {
          transaction,
        })
        await transaction.commit()

        return res.json(pedido)
      } catch (error) {
        console.log(error)
        if (transaction) await transaction.rollback()
        return res.status(409).json({ error: 'Transaction failed' })
      }
    }
    return res.status(401).json({ error: 'Invalid option' })
  }

  async delete(req, res) {
    const { option } = req
    const id = parseInt(req.params.id, 10)

    const { usuario_id } = req

    let transaction
    try {
      transaction = await Oferta.sequelize.transaction()
      const pedido = await Pedido.findOne({ where: id }, { transaction })
      if (!pedido) {
        return res.status(404).json({ error: 'pedido inexistente' })
      }
      if (pedido.status !== 'aberto') {
        return res.status(401).json({
          error: 'não é possível cancelar um pedido já cancelado ou fechado',
        })
      }
      const statusLoja = await StatusLoja.findOne()
      if (pedido.cliente_id !== usuario_id && option !== 'administrador') {
        return res.status(403).json({ error: 'permissao negada' })
      }
      if (option !== 'administrador') {
        const validadeOferta = await ValidadeOferta.findOne(
          {
            where: { status: 'ativa' },
          },
          { transaction },
        )
        if (validadeOferta.status !== 'ativa' || !statusLoja.is_open) {
          return res.status(403).json({
            error:
              'não é posssivel cancelar um pedido em que a validade da oferta já foi expirada ou quando a loja está fechada',
          })
        }
      }
      const ofertaPedido = await OfertaPedido.findAll(
        {
          where: { pedido_id: id },
        },
        { transaction },
      )

      for (const off of ofertaPedido) {
        const ofer = await Oferta.findOne(
          { where: { id: off.oferta_id } },
          transaction,
        )
        await ofer.increment('quantidade', {
          by: off.quantidade,
          transaction,
        })
        // await off.destroy({ transaction })
      }

      pedido.status = 'cancelado'
      await pedido.save()
      await transaction.commit()
      return res.json({ ok: true })
    } catch (error) {
      console.log(error)
      if (transaction) await transaction.rollback()
      return res.status(409).json({ error: 'Transaction failed' })
    }
  }
}

export default new PedidoController()
