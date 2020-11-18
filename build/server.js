"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _App = require('./App'); var _App2 = _interopRequireDefault(_App);

require('dotenv').config()

_App2.default.listen(process.env.PORT || 3333)
