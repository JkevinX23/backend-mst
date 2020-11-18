"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _Oferta = require('../models/Oferta'); var _Oferta2 = _interopRequireDefault(_Oferta);
var _Pedido = require('../models/Pedido'); var _Pedido2 = _interopRequireDefault(_Pedido);

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
      transaction = await _Oferta2.default.sequelize.transaction()
      const OfertaObj = {
        produto_id,
        quantidade,
        valor_unitario,
        validade_oferta_id,
      }

      const oferta = await _Oferta2.default.create(OfertaObj, { transaction })

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
      const ofertas = await _Oferta2.default.findAll({
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
          const pedidos = await _Pedido2.default.findAll({
            where: { id: oferta.id, status: ['aberto', 'entregue'] },
          })
          const off = oferta
          const qtd_disponivel = oferta.quantidade - pedidos.length
          return { off, qtd_disponivel }
        }),
      )
      return res.json(response)
    }
    const ofertas = await _Oferta2.default.findAll({
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
        const pedidos = await _Pedido2.default.findAll({
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
exports. default = new OfertaController()
