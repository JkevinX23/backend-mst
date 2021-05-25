import Sequelize, { Op } from 'sequelize'
import ValidadeOferta from '../models/ValidadeOferta'
import Pedido from '../models/Pedido'

class ExpirarOfertas {
  async expirar() {
    const oferta = await ValidadeOferta.findOne({
      where: {
        validade: { [Op.lte]: Sequelize.fn('CURDATE') },
        status: 'ativa',
      },
    })

    if (!oferta) {
      return
    }
    oferta.status = 'inativa'
    oferta.save()
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
              where: { id: oferta.id },
            },
          ],
        },
      ],
    })

    pedidosAFechar.forEach(elem => {
      if (elem.status !== 'cancelado') elem.status = 'fechado'
      elem.save()
    })
  }
}
export default new ExpirarOfertas()
