import * as Yup from 'yup'

import StatusLoja from '../models/StatusLoja'

class StatusLojaController {
  async index(req, res) {
    const status = await StatusLoja.findOne()
    if (status.is_open) {
      return res.json({ success: 'aberta' })
    }
    return res.json({ success: 'fechada' })
  }

  async store(req, res) {
    const { option } = req
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }

    const schema = Yup.object().shape({
      lojaAberta: Yup.boolean().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    const { lojaAberta } = req.body
    const s = await StatusLoja.findOne()
    s.is_open = lojaAberta
    await s.save()
    const lojaStatus = ['fechada', 'aberta']
    return res
      .status(200)
      .json({ success: `loja ${lojaStatus[lojaAberta + 0]}` })
  }
}
export default new StatusLojaController()
