import * as Yup from 'yup'
import Administrador from '../models/Administrador'
import Autorizacao from '../models/Autorizacao'
import TipoUsuarios from '../models/TipoUsuarios'

class AdminController {
  async store(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }
    const { email, nome, password } = req.body

    const exists = await Autorizacao.findOne({ where: { email } })
    if (exists) {
      return res.status(400).json({ error: 'Email already exists.' })
    }

    let transaction
    try {
      transaction = await Administrador.sequelize.transaction()
      const client = {
        nome,
        email,
        password,
      }

      const admin = await Administrador.create(client, { transaction })

      let tipo = await TipoUsuarios.findOne({
        where: { tipo: 'administrador' },
      })

      if (!tipo) {
        tipo = await TipoUsuarios.create(
          { tipo: 'administrador' },
          { transaction },
        )
      }
      await Autorizacao.create(
        {
          email,
          tipo_id: tipo.id,
          usuario_id: admin.id,
        },
        { transaction },
      )
      await transaction.commit()

      return res.json({
        admin: {
          nome,
          email,
          id: admin.id,
        },
      })
    } catch (err) {
      console.log(err)
      await transaction.rollback()
      return res.status(409).json({ error: 'Transaction failed' })
    }
  }
}
export default new AdminController()
