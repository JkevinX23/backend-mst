import * as Yup from 'yup'
import Pedido from '../models/Pedido'
import OfertaPedido from '../models/OfertaPedido'

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
      transaction = await Pedido.sequelize.transaction()
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

      const pedido = await Pedido.create(objPedido, { transaction })

      const ofertaPedidos = ofertas.map(off => ({
        ...off,
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
}

export default new PedidoController()
