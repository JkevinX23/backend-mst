import Pedido from '../models/Pedido'

class RelatorioProdutosSemanaisController {
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
      ],
      required: true,
    })

    const produtos = []
    pedidos.forEach(elem => {
      elem.ofertas.forEach(off => {
        const obj = {
          idProduto: off.produtos.id,
          nomeProduto: off.produtos.nome,
          quantidade: off.oferta_pedidos.dataValues.quantidade,
        }
        produtos.push(obj)
      })
    })

    const response = []

    produtos.forEach(prod => {
      const resp = response.findIndex(elem => {
        return elem.idProduto === prod.idProduto
      })
      if (resp === -1) {
        response.push(prod)
      }
      if (resp >= 0) {
        produtos[resp].quantidade += prod.quantidade
      }
    })

    return res.json(response)
  }
}

export default new RelatorioProdutosSemanaisController()
