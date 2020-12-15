import Cliente from '../models/Cliente'
import Pedido from '../models/Pedido'
import Produtos from '../models/Produtos'

class ContadorEstatisticaController {
  async show(req, res) {
    const usuariosCadastrados = await Cliente.count().then(c => {
      return c
    })

    const pedidosRealizados = await Pedido.count().then(c => {
      return c
    })

    const produtosCadastrados = await Produtos.count().then(c => {
      return c
    })

    return res.json({
      usuariosCadastrados,
      pedidosRealizados,
      produtosCadastrados,
    })
  }
}
export default new ContadorEstatisticaController()
