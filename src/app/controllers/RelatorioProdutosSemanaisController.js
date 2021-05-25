import Pedido from '../models/Pedido'
import ValidadeOferta from '../models/ValidadeOferta'

class RelatorioProdutosSemanaisController {
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
      ],
      required: true,
      where: { status: 'aberto' },
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

    const validade = await ValidadeOferta.findOne({
      where: { id: validade_oferta_id },
    })
    validade.status = 'inativa'

    const pedidosAFechar = await Pedido.findAll({
      include: [
        {
          association: 'ofertas',
          through: {
            attributes: ['quantidade'],
          },
          include: [
            {
              association: 'validade',
              required: true,
              where: { id: validade_oferta_id },
            },
          ],
        },
      ],
    })

    pedidosAFechar.forEach(elem => {
      if (elem.status !== 'cancelado') elem.status = 'fechado'
      elem.save()
    })

    await validade.save()

    return res.json(response)
  }
}

export default new RelatorioProdutosSemanaisController()
