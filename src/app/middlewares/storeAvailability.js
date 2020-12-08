import Sequelize, { Op } from 'sequelize'
import validadeOferta from '../models/ValidadeOferta'

export default async (req, res, next) => {
  try {
    const off = await validadeOferta.findOne({
      where: {
        validade: { [Op.gt]: Sequelize.fn('CURDATE') },
        status: 'ativa',
      },
    })
    if (!off) {
      return res.status(401).json({ error: 'Loja fechada' })
    }
  } catch (error) {
    return res.status(401).json({ error: 'error' })
  }
  return next()
}
