"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _jsonwebtoken = require('jsonwebtoken'); var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);
var _util = require('util');

var _authConfig = require('../../config/authConfig'); var _authConfig2 = _interopRequireDefault(_authConfig);

exports. default = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided ' })
  }

  const [, token] = authHeader.split(' ')
  try {
    const decoced = await _util.promisify.call(void 0, _jsonwebtoken2.default.verify)(token, _authConfig2.default.secret)
    req.option = decoced.option
    req.usuario_id = decoced.id
    if (decoced.option !== 'administrador') {
      return res.status(401).json({ error: 'Token Invalid' })
    }
  } catch (error) {
    return res.status(401).json({ error: 'Token Invalid' })
  }
  return next()
}
