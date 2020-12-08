import Sequelize, { Op } from 'sequelize'
import ValidadeOferta from '../models/ValidadeOferta'

class ExpirarOfertas {
  async expirar() {
    const expiradas = await ValidadeOferta.update(
      { status: 'inativa' },
      {
        where: {
          validade: { [Op.lte]: Sequelize.fn('CURDATE') },
          status: 'ativa',
        },
      },
    )
    // expiradas.forEach(element => {
    //   element.status = 'inativa'
    // })
    console.log(expiradas)
  }
}
export default new ExpirarOfertas()
