import jwt from 'jsonwebtoken'
import { promisify } from 'util'
import authConfig from '../../config/authConfig'
import sendMailNoAttachment from '../../util/sendMail'
import Emails from '../models/Autorizacao'
import Cliente from '../models/Cliente'
import Administrador from '../models/Administrador'

class ForgetPassword {
  async forget(req, res) {
    const { email } = req.body

    const cliente = await Cliente.findOne({ where: { email } })

    if (!cliente) {
      const admin = await Emails.findOne({ where: { email } })

      if (!admin) {
        return res.status(401).json('User does not exists')
      }
      const { client, type } = admin

      const token = jwt.sign({ id: client, type }, authConfig.secret, {
        expiresIn: authConfig.forgetExpiresIn,
      })

      const link = process.env.EMAIL_SITE + token

      const context = {
        name: ' ',
        link,
      }

      sendMailNoAttachment(
        ' ',
        admin.email,
        'Recupere sua senha',
        'layouts/forgotPassword',
        context,
      )

      return res.json({ ok: true })
    }

    const { id } = cliente

    const token = jwt.sign({ id, type: 0 }, authConfig.secret, {
      expiresIn: 3600,
    })

    const link = process.env.EMAIL_SITE + token
    const context = {
      name: cliente.name,
      link,
    }

    sendMailNoAttachment(
      cliente.name,
      cliente.email,
      'Recupere sua senha',
      'layouts/forgotPassword',
      context,
    )

    return res.json({ ok: true })
  }

  async reset(req, res) {
    const { password, token } = req.body

    if (!token) {
      return res.status(401).json({ error: 'Token invalid' })
    }

    const decoced = await promisify(jwt.verify)(token, authConfig.secret)
    const userId = decoced.id
    const { option } = decoced

    switch (option) {
      case 'cliente':
        try {
          const user = await Cliente.findByPk(userId)

          if (!user) {
            return res.status(401).json({ error: 'Token Invalid' })
          }
          await user.update({ password })
          return res.json({ ok: true })
        } catch (error) {
          return res.status(401).json({ error: 'Token Invalid' })
        }
      case 'administrador':
        try {
          const adm = await Administrador.findByPk(userId)
          if (!adm) return res.status(404).json({ error: 'User not found' })
          await adm.update({ password })
          return res.json({ ok: true })
        } catch (error) {
          return res.status(401).json({ error: 'Token Invalid' })
        }

      default:
        return res.status(405).json({ error: 'Error' })
    }
  }
}

export default new ForgetPassword()
