import Sequelize, { Op } from 'sequelize'
import validadeOferta from '../models/ValidadeOferta'
import StatusLoja from '../models/StatusLoja'

export default async (req, res, next) => {
  try {
    const off = await validadeOferta.findOne({
      where: {
        validade: { [Op.gt]: Sequelize.fn('CURDATE') },
        status: 'ativa',
      },
    })
    const status = await StatusLoja.findOne()
    if (!status.is_open) {
      return res
        .status(401)
        .json({ error: 'Loja fechada - Motivo: Fechada manualmente' })
    }
    if (!off) {
      return res
        .status(401)
        .json({ error: 'Loja fechada - Motivo: Sem ofertas ativas' })
    }
  } catch (error) {
    return res.status(401).json({ error: 'error' })
  }
  return next()
}
