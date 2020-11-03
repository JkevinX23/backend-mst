import * as Yup from 'yup'
import TipoUsuarios from '../models/TipoUsuarios'

class TipoUsuarioController {
  async store(req, res) {
    const schema = Yup.object().shape({
      tipo: Yup.string().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }
    const { tipo } = req.body

    let transaction
    try {
      transaction = await TipoUsuarios.sequelize.transaction()
      const response = await TipoUsuarios.create({ tipo }, { transaction })
      await transaction.commit()
      return res.json(response)
    } catch (error) {
      console.log(error)
      if (transaction) await transaction.rollback()
      return res.status(409).json({ error: 'Transaction Error' })
    }
  }
}
export default new TipoUsuarioController()
