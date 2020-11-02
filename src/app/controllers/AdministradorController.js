import * as Yup from 'yup'
import Administrador from '../models/Administrador'
// import Emails from '../models/Emails'

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

    // const exists = await Emails.findOne({ where: { email } })
    // if (exists) {
    //   return res.status(400).json({ error: 'Admin already exists.' })
    // }

    let transaction
    try {
      transaction = await Administrador.sequelize.transaction()
      const client = {
        nome,
        email,
        password,
      }

      const admin = await Administrador.create(client, { transaction })

      // await Emails.create(
      //   {
      //     email,
      //     type: 1,
      //     client_id: admin.id,
      //   },
      //   { transaction },
      // )
      await transaction.commit()
      return res.json(admin)
    } catch (err) {
      console.log(err)
      await transaction.rollback()
      return res.status(409).json({ error: 'Transaction failed' })
    }
  }
}
export default new AdminController()
