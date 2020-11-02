import Imagens from '../models/Imagens'
import fileCompress from '../middlewares/fileCompress'

class ImagensController {
  async store(req, res) {
    if (req.file) {
      fileCompress
        .compressImage(req.file, 300)
        .then(async newPath => {
          const { option } = req
          if (option !== 'administrador') {
            return res.status(403).json({ error: 'Permissão negada!' })
          }

          const { originalname: name } = req.file
          const { filename } = newPath

          const file = await Imagens.create({ name, path: filename })

          return res.json(file)
        })
        .catch(err => console.log(err))
    }
  }
}

export default new ImagensController()
