import * as Yup from 'yup'
import jwt from 'jsonwebtoken'
import { promisify } from 'util'
import authConfig from '../../config/authConfig'
import sendMailNoAttachment from '../../util/sendMail'
import Autorizacao from '../models/Autorizacao'
import Cliente from '../models/Cliente'
import Administrador from '../models/Administrador'
import TipoUsuarios from '../models/TipoUsuarios'

class ForgetPassword {
  async forget(req, res) {
    const { email } = req.body

    const usuario = await Autorizacao.findOne({ where: { email } })

    if (!usuario) {
      return res.json({ ok: true })
    }

    const { tipo_id, usuario_id } = usuario

    const tipoUsuario = await TipoUsuarios.findOne({ where: { id: tipo_id } })

    let usuarioDetalhes = {}

    switch (tipoUsuario.tipo) {
      case 'cliente': {
        const cliente = await Cliente.findOne({ where: { id: usuario_id } })
        usuarioDetalhes = cliente
        break
      }
      case 'administrador': {
        const administrador = await Administrador.findOne({
          where: { id: usuario_id },
        })
        usuarioDetalhes = administrador
        break
      }
      default:
        break
    }

    const token = jwt.sign(
      { id: usuarioDetalhes.id, option: tipoUsuario.tipo },
      authConfig.secret,
      {
        expiresIn: 3600,
      },
    )

    const link = `https://veredasdaterra.com.br/token_recuperacao/${token}`
    const context = {
      name: usuarioDetalhes.nome,
      link,
    }

    sendMailNoAttachment(
      usuarioDetalhes.nome,
      usuario.email,
      'Recupere sua senha',
      'layouts/forgotPassword',
      context,
    )

    return res.json({ ok: true })
  }

  async reset(req, res) {
    const schema = Yup.object().shape({
      password: Yup.string().required().min(6),
    })

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Password must have at least 6 characters' })
    }
    const { password, token } = req.body

    if (!token) {
      return res.status(400).json({ error: 'Token not provided' })
    }

    let decoded
    try {
      decoded = await promisify(jwt.verify)(token, authConfig.secret)
    } catch (error) {
      return res.status(401).json({ error: 'Token Invalid' })
    }

    const userId = decoded.id
    const { option } = decoded

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
