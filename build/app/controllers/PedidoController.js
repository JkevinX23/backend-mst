"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _Pedido = require('../models/Pedido'); var _Pedido2 = _interopRequireDefault(_Pedido);
var _OfertaPedido = require('../models/OfertaPedido'); var _OfertaPedido2 = _interopRequireDefault(_OfertaPedido);

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
      return res.status(400).json({ error: 'Validation fails' })
    }

    /*
              @FALTANDO VERIFICACAO DE QUANTIDADES ( SE TEM ESTOQUE )

    */

    const { option, usuario_id } = req

    let transaction
    try {
      transaction = await _Pedido2.default.sequelize.transaction()
      const objPedido = {}
      const {
        ofertas,
        cliente_id,
        tipo_pagamento_id,
        status,
        valor_frete,
      } = req.body
      objPedido.tipo_pagamento_id = tipo_pagamento_id
      objPedido.valor_frete = valor_frete

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

      const pedido = await _Pedido2.default.create(objPedido, { transaction })

      const ofertaPedidos = ofertas.map(off => ({
        ...off,
        pedido_id: pedido.id,
      }))

      const oferta_pedido = await _OfertaPedido2.default.bulkCreate(ofertaPedidos, {
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
}

exports. default = new PedidoController()
