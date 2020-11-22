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
        },
      })
    } catch (err) {
      console.log(err)
      await transaction.rollback()
      return res.status(409).json({ error: 'Transaction failed' })
    }
  }

  async index(req, res) {
    const { option } = req

    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }
    const administradores = await Administrador.findAll({
      attributes: ['id', 'nome', 'email'],
    })
    return res.json(administradores)
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field,
        ),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    const { option, usuario_id } = req

    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }
    const { email, oldPassword } = req.body
    const administrador = await Administrador.findByPk(usuario_id)
    let alterEmail = false

    if (email && email !== administrador.email) {
      const exists = await Autorizacao.findOne({
        where: { email },
      })
      if (exists) {
        return res
          .status(402)
          .json({ error: 'Email já cadastrado na base de dados' })
      }
      alterEmail = true
    }

    if (oldPassword && !(await administrador.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' })
    }

    let transaction
    try {
      transaction = await Administrador.sequelize.transaction()
      const response = await administrador.update(req.body, { transaction })
      if (alterEmail) {
        const { id } = await TipoUsuarios.findOne({
          where: { tipo: 'administrador' },
        })
        const adm = await Autorizacao.findOne({
          where: { tipo_id: id, usuario_id },
        })
        await adm.update({ email }, { transaction })
      }
      await transaction.commit()
      return res.json(response)
    } catch (error) {
      console.log(error)
      if (transaction) await transaction.rollback()
      return res.status(409).json({ error: 'Transaction failed' })
    }
  }

  async show(req, res) {
    const { option } = req
    const { id } = req.params
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }

    const administrador = await Administrador.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ['password_hash', 'createdAt', 'updatedAt'],
      },
    })
    if (!administrador) {
      return res.json({ error: 'not found' })
    }
    return res.json(administrador)
  }
}

export default new AdminController()
