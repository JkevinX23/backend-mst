import * as Yup from 'yup'
import jwt from 'jsonwebtoken'
import { promisify } from 'util'

import authConfig from '../../config/authConfig'
import Administrador from '../models/Administrador'
import Autorizacao from '../models/Autorizacao'
import TipoUsuarios from '../models/TipoUsuarios'
import Cliente from '../models/Cliente'

class SessaoController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }
    const { email, password } = req.body

    const usuario = await Autorizacao.findOne({
      where: { email },
      include: [{ model: TipoUsuarios, as: 'Tipo' }],
    })
    if (!usuario) {
      return res.status(404).json({ error: 'Client not found' })
    }

    const { Tipo, usuario_id } = usuario

    async function AdministradorLogin() {
      const admin = await Administrador.findByPk(usuario_id)
      if (!admin) return res.status(401).json({ error: 'User not found ' })
      if (!(await admin.checkPassword(password)))
        return res.status(401).json({ error: 'Password does not match ' })
      const { id, nome } = admin
      return res.json({
        option: Tipo.tipo,
        client: {
          id,
          nome,
          email,
        },
        token: jwt.sign({ id, option: Tipo.tipo }, authConfig.secret, {
          expiresIn: authConfig.expiresIn,
        }),
      })
    }

    async function ClienteLogin() {
      const cliente = await Cliente.findByPk(usuario_id)
      if (!cliente) return res.status(401).json({ error: 'User not found ' })
      if (!(await cliente.checkPassword(password)))
        return res.status(401).json({ error: 'Password does not match ' })
      const { id, nome } = cliente
      return res.json({
        option: Tipo.tipo,
        client: {
          id,
          nome,
          email,
        },
        token: jwt.sign({ id, option: Tipo.tipo }, authConfig.secret, {
          expiresIn: authConfig.expiresIn,
        }),
      })
    }

    switch (Tipo.tipo) {
      case 'administrador':
        return AdministradorLogin()
      case 'cliente':
        return ClienteLogin()
      default:
        return res.status(404).json({ error: 'Falha ao efetuar o login' })
    }
  }

  async validaToken(req, res) {
    const { token } = req.body
    try {
      const decoced = await promisify(jwt.verify)(token, authConfig.secret)
      const { option } = decoced
      const { id } = decoced
      switch (option) {
        case 'administrador':
          try {
            const admin = await Administrador.findByPk(id)
            const { nome, email } = admin
            return res.json({ id, nome, email })
          } catch (err) {
            console.log(err)
            return res.status(403).json({ error: 'Invalid Token' })
          }
        default:
          try {
            const cliente = await Cliente.findByPk(id)
            const { nome, email } = cliente
            return res.json({ id, nome, email })
          } catch (err) {
            console.log(err)
            return res.status(403).json({ error: 'Invalid Token' })
          }
      }
    } catch (err) {
      return res.status(403).json({ error: 'Invalid Token' })
    }
  }
}
export default new SessaoController()
