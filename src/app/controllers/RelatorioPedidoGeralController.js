import Pedido from '../models/Pedido'
import ValidadeOferta from '../models/ValidadeOferta'

class RelatorioPedidoGeralController {
  // query param para nao invalidar off dps
  async gerar(req, res) {
    const { option } = req
    const { validade_oferta_id } = req.params

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
            {
              association: 'validade',
              required: true,
              where: { id: validade_oferta_id },
            },
          ],
        },
        {
          association: 'clientes',
          include: {
            association: 'enderecos',
          },
        },
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
          id: elem.clientes.id,
          nome: elem.clientes.nome,
          cpf: elem.clientes.cpf,
          telefone: elem.clientes.telefone,
          endereco: elem.clientes.enderecos,
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

    const validade = await ValidadeOferta.findOne({
      where: { id: validade_oferta_id },
    })
    validade.status = 'inativa'
    await validade.save()

    return res.json(response)
  }
}

export default new RelatorioPedidoGeralController()
