import Imagens from '../models/Imagens'
import fileCompress from '../middlewares/fileCompress'

class ImagensController {
  async store(req, res) {
    if (req.file) {
      fileCompress
        .compressImage(req.file, 300)
        .then(async newPath => {
          const { originalname: nome } = req.file
          const { filename } = newPath
          const file = await Imagens.create({ nome, path: filename })
          return res.json(file)
        })
        .catch(err => console.log(err))
    }
  }
}

export default new ImagensController()
