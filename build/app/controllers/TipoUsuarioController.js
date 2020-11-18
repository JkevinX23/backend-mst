"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _TipoUsuarios = require('../models/TipoUsuarios'); var _TipoUsuarios2 = _interopRequireDefault(_TipoUsuarios);

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
      transaction = await _TipoUsuarios2.default.sequelize.transaction()
      const response = await _TipoUsuarios2.default.create({ tipo }, { transaction })
      await transaction.commit()
      return res.json(response)
    } catch (error) {
      console.log(error)
      if (transaction) await transaction.rollback()
      return res.status(409).json({ error: 'Transaction Error' })
    }
  }

  async index(req, res) {
    const tipos = await _TipoUsuarios2.default.findAll()
    return res.json(tipos)
  }
}
exports. default = new TipoUsuarioController()
