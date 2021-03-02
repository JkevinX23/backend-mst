import Pedido from '../models/Pedido'

class RelatorioPedidoGeralController {
  async gerar(req, res) {
    const { option } = req
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }
    const pedidos = await Pedido.findAll({
      include: [
        {
          association: 'ofertas',
          required: true,
          through: {
            attributes: ['quantidade'],
          },
          include: [
            {
              association: 'produtos',
              required: true,
            },
          ],
        },
        { association: 'clientes' },
        { association: 'pagamento' },
        { association: 'frete' },
      ],
      required: true,
    })

    const response = pedidos.map(elem => {
      const prod = elem.ofertas.map(off => {
        return {
          id: off.produtos.id,
          nome: off.produtos.nome,
          preco: off.valor_unitario,
          quantidade: off.oferta_pedidos.dataValues.quantidade,
        }
      })
      let totalProdutos = 0
      prod.forEach(p => {
        totalProdutos += p.preco * p.quantidade
      })

      const totalPedido = totalProdutos + elem.frete.valor_frete

      return {
        cliente: {
          nome: elem.clientes.nome,
          cpf: elem.clientes.cpf,
          telefone: elem.clientes.telefone,
        },
        pedido: {
          id: elem.id,
          metodo_pagamento: elem.pagamento.titulo,
          frete: elem.frete.nome,
          valor_frete: elem.frete.valor_frete,
          data_pedido: elem.created_at,
          totalPedido,
          produtos: { ...prod },
        },
      }
    })

    return res.json(response)
  }
}

export default new RelatorioPedidoGeralController()
