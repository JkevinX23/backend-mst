"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _jsonwebtoken = require('jsonwebtoken'); var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _authConfig = require('../../config/authConfig'); var _authConfig2 = _interopRequireDefault(_authConfig);
var _Administrador = require('../models/Administrador'); var _Administrador2 = _interopRequireDefault(_Administrador);
var _Autorizacao = require('../models/Autorizacao'); var _Autorizacao2 = _interopRequireDefault(_Autorizacao);
var _TipoUsuarios = require('../models/TipoUsuarios'); var _TipoUsuarios2 = _interopRequireDefault(_TipoUsuarios);
var _Cliente = require('../models/Cliente'); var _Cliente2 = _interopRequireDefault(_Cliente);

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

    const usuario = await _Autorizacao2.default.findOne({
      where: { email },
      include: [{ model: _TipoUsuarios2.default, as: 'Tipo' }],
    })
    if (!usuario) {
      return res.status(404).json({ error: 'Client not found' })
    }

    const { Tipo, usuario_id } = usuario

    async function AdministradorLogin() {
      const admin = await _Administrador2.default.findByPk(usuario_id)
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
        token: _jsonwebtoken2.default.sign({ id, option: Tipo.tipo }, _authConfig2.default.secret, {
          expiresIn: _authConfig2.default.expiresIn,
        }),
      })
    }

    async function ClienteLogin() {
      const cliente = await _Cliente2.default.findByPk(usuario_id)
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
        token: _jsonwebtoken2.default.sign({ id, option: Tipo.tipo }, _authConfig2.default.secret, {
          expiresIn: _authConfig2.default.expiresIn,
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
}
exports. default = new SessaoController()
