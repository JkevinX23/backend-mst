"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _Cliente = require('../models/Cliente'); var _Cliente2 = _interopRequireDefault(_Cliente);
var _Autorizacao = require('../models/Autorizacao'); var _Autorizacao2 = _interopRequireDefault(_Autorizacao);
var _TipoUsuarios = require('../models/TipoUsuarios'); var _TipoUsuarios2 = _interopRequireDefault(_TipoUsuarios);
var _Enderecos = require('../models/Enderecos'); var _Enderecos2 = _interopRequireDefault(_Enderecos);

class ClienteController {
  async store(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),
      cpf: Yup.number().required(),
      telefone: Yup.number().required(),
      cep: Yup.number().required(),
      estado: Yup.string().required(),
      cidade: Yup.string().required(),
      bairro: Yup.string().required(),
      logradouro: Yup.string().required(),
      numero: Yup.string().required(),
      complemento: Yup.string(),
      referencia: Yup.string(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    const { email, nome, password, cpf, telefone } = req.body
    const {
      cep,
      estado,
      cidade,
      bairro,
      logradouro,
      numero,
      complemento,
      referencia,
    } = req.body

    const exists = await _Autorizacao2.default.findOne({ where: { email } })
    if (exists) {
      return res.status(400).json({ error: 'Email already exists.' })
    }

    const exists2 = await _Cliente2.default.findOne({ where: { cpf } })
    if (exists2) {
      return res.status(401).json({ error: 'CPF already exists.' })
    }

    let transaction
    try {
      transaction = await _Cliente2.default.sequelize.transaction()
      const endereco = {
        cep,
        estado,
        cidade,
        bairro,
        logradouro,
        numero,
        complemento,
        referencia,
      }

      const end = await _Enderecos2.default.create(endereco, { transaction })

      const client = {
        nome,
        email,
        password,
        cpf,
        telefone,
        endereco_id: end.id,
      }

      const cliente = await _Cliente2.default.create(client, { transaction })

      let tipo = await _TipoUsuarios2.default.findOne({
        where: { tipo: 'cliente' },
      })

      if (!tipo) {
        tipo = await _TipoUsuarios2.default.create({ tipo: 'cliente' }, { transaction })
      }
      await _Autorizacao2.default.create(
        {
          email,
          tipo_id: tipo.id,
          usuario_id: cliente.id,
        },
        { transaction },
      )
      await transaction.commit()
      return res.json(cliente)
    } catch (err) {
      console.log(err)
      if (transaction) await transaction.rollback()
      return res.status(409).json({ error: 'Transaction failed' })
    }
  }

  async index(req, res) {
    const { option } = req
    const { pagina = 1, limite = 20 } = req.query
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }
    const clientes = await _Cliente2.default.findAll({
      limit: parseInt(limite, 10),
      offset: (pagina - 1) * limite,
      attributes: { exclude: ['password_hash'] },
      include: { association: 'enderecos' },
    })
    return res.json(clientes)
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number(),
      nome: Yup.string(),
      email: Yup.string().email(),
      cpf: Yup.string(),
      telefone: Yup.string(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field,
        ),
      logradouro: Yup.string(),
      bairro: Yup.string(),
      cidade: Yup.string(),
      estado: Yup.string(),
      numero: Yup.string(),
      complemento: Yup.string(),
      cep: Yup.string(),
      referencia: Yup.string(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    const { option, usuario_id } = req
    const { email, oldPassword, id } = req.body

    if (id !== usuario_id && option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }

    const cliente = await _Cliente2.default.findByPk(id, {
      // include: { model: Enderecos, as: 'enderecos' },
    })

    const { endereco_id } = cliente
    const endereco = await _Enderecos2.default.findByPk(endereco_id)

    let alterEmail = false

    if (email && email !== cliente.email) {
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

    if (oldPassword && !(await cliente.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' })
    }
    let transaction
    try {
      transaction = await _Cliente2.default.sequelize.transaction()

      const clientResponse = await cliente
        .update(req.body, { transaction })
        .then(function (tagData) {
          return tagData.toJSON()
        })

      const addressResponse = await endereco
        .update(req.body, { where: { id: endereco_id } }, { transaction })
        .then(function (tagData) {
          return tagData.toJSON()
        })

      if (alterEmail) {
        const { id: cli_id } = await _TipoUsuarios2.default.findOne({
          where: { tipo: 'cliente' },
        })
        const clienteObj = await _Autorizacao2.default.findOne({
          where: { tipo_id: cli_id, usuario_id: id },
        })
        await clienteObj.update({ email }, { transaction })
      }
      cliente.enderecos = addressResponse
      await transaction.commit()

      const resposta = clientResponse
      resposta.enderecos = addressResponse

      return res.json({ cliente: resposta })
    } catch (error) {
      console.log(error)
      if (transaction) await transaction.rollback()
      return res.status(409).json({ error: 'Transaction failed' })
    }
  }
}

exports. default = new ClienteController()
