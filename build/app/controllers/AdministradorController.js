"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);

var _Administrador = require('../models/Administrador'); var _Administrador2 = _interopRequireDefault(_Administrador);
var _Autorizacao = require('../models/Autorizacao'); var _Autorizacao2 = _interopRequireDefault(_Autorizacao);
var _TipoUsuarios = require('../models/TipoUsuarios'); var _TipoUsuarios2 = _interopRequireDefault(_TipoUsuarios);

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

    const exists = await _Autorizacao2.default.findOne({ where: { email } })

    if (exists) {
      return res.status(400).json({ error: 'Email already exists.' })
    }

    let transaction
    try {
      transaction = await _Administrador2.default.sequelize.transaction()
      const client = {
        nome,
        email,
        password,
      }

      const admin = await _Administrador2.default.create(client, { transaction })

      let tipo = await _TipoUsuarios2.default.findOne({
        where: { tipo: 'administrador' },
      })

      if (!tipo) {
        tipo = await _TipoUsuarios2.default.create(
          { tipo: 'administrador' },
          { transaction },
        )
      }

      await _Autorizacao2.default.create(
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
    const administradores = await _Administrador2.default.findAll({
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
    const administrador = await _Administrador2.default.findByPk(usuario_id)
    let alterEmail = false

    if (email && email !== administrador.email) {
      const exists = await _Autorizacao2.default.findOne({
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
      transaction = await _Administrador2.default.sequelize.transaction()
      const response = await administrador.update(req.body, { transaction })
      if (alterEmail) {
        const { id } = await _TipoUsuarios2.default.findOne({
          where: { tipo: 'administrador' },
        })
        const adm = await _Autorizacao2.default.findOne({
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
}

exports. default = new AdminController()
