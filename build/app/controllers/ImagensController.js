"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _Imagens = require('../models/Imagens'); var _Imagens2 = _interopRequireDefault(_Imagens);
var _fileCompress = require('../middlewares/fileCompress'); var _fileCompress2 = _interopRequireDefault(_fileCompress);

class ImagensController {
  async store(req, res) {
    if (req.file) {
      _fileCompress2.default
        .compressImage(req.file, 300)
        .then(async newPath => {
          const { originalname: name } = req.file
          const { filename } = newPath
          const file = await _Imagens2.default.create({ name, path: filename })
          return res.json(file)
        })
        .catch(err => console.log(err))
    }
  }
}

exports. default = new ImagensController()
