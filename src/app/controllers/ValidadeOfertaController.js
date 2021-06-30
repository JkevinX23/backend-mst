import * as Yup from 'yup'
import { parseISO, isBefore } from 'date-fns'
import { Op } from 'sequelize'
import ValidadeOferta from '../models/ValidadeOferta'
import Oferta from '../models/Oferta'
import Categoria from '../models/Categoria'

class ValidadeOfertaController {
  async store(req, res) {
    const { option } = req
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }

    const jaExiste = await ValidadeOferta.findOne({
      where: { status: 'ativa' },
    })
    if (jaExiste) {
      return res.status(403).json({
        error:
          "Só é possível ter uma validadeOferta com status 'ativa' por vez.",
      })
    }

    const schema = Yup.object().shape({
      validade: Yup.date().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    let { validade } = req.body

    validade = parseISO(validade)

    if (isBefore(validade, new Date())) {
      return res.status(401).json({ error: 'Past dates are not permitted' })
    }

    let transaction
    try {
      transaction = await ValidadeOferta.sequelize.transaction()
      const validadeOfertaObj = {
        validade,
        status: 'ativa',
      }

      const validadeOferta = await ValidadeOferta.create(validadeOfertaObj, {
        transaction,
      })
      await transaction.commit()
      return res.json(validadeOferta)
    } catch (err) {
      console.log(err)
      if (transaction) await transaction.rollback()
      return res.status(409).json({ error: 'Transaction failed' })
    }
  }

  async index(req, res) {
    const { option } = req
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }
    const { status } = req.query
    const { pagina = 1, limite = 2147483645 } = req.query

    const where = {
      status: {
        [Op.not]: null,
      },
    }
    if (status === 'ativa') {
      where.status = 'ativa'
    }
    if (status === 'inativa') {
      where.status = 'inativa'
    }

    const validadeOferta = await ValidadeOferta.findAll({
      limit: parseInt(limite, 10),
      offset: (pagina - 1) * limite,
      where,
      order: [['createdAt', 'DESC']],
    })
    return res.json(validadeOferta)
  }

  async update(req, res) {
    const { option } = req
    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }
    const schema = Yup.object().shape({
      validade_id: Yup.number().required(),
      status: Yup.string().test(
        'Teste-Status',
        'Status deve ser ativa ou inativa',
        value => value === 'ativa' || value === 'inativa' || !value,
      ),
      validade: Yup.date(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    const { validade_id } = req.body
    const validadeOferta = await ValidadeOferta.findByPk(validade_id)

    if (!validadeOferta) {
      return res.status(404).json({ error: 'ID inválido' })
    }

    const update = {}
    const { status } = req.body
    let { validade } = req.body

    if (validade) {
      validade = parseISO(validade)
      if (isBefore(validade, new Date())) {
        return res.status(401).json({ error: 'Past dates are not permitted' })
      }
      update.validade = validade
    }
    if (status) {
      update.status = status
    }

    let transaction
    try {
      transaction = await ValidadeOferta.sequelize.transaction()
      const { id, validade: v, status: s } = await validadeOferta.update(
        update,
        {
          where: {
            id: validade_id,
          },
          transaction,
        },
      )

      return res.json({
        response: {
          id,
          validade: v,
          status: s,
        },
      })
    } catch (err) {
      console.log(err)
      if (transaction) await transaction.rollback()
      return res.status(409).json({ error: 'Transaction failed' })
    }
  }

  async show(req, res) {
    const { option } = req
    const { id } = req.params

    if (option !== 'administrador') {
      return res.status(403).json({ error: 'Permissao negada' })
    }

    const ofertas = await Oferta.findAll({
      include: [
        {
          association: 'produtos',
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'imagem_id'],
          },
          include: [
            {
              association: 'imagem',
              attributes: ['url', 'path'],
            },
            {
              model: Categoria,
              as: 'categorias',
              through: {
                attributes: [],
              },
              attributes: {
                exclude: ['updatedAt', 'createdAt', 'isvalid'],
              },
            },
          ],
        },
        {
          association: 'validade',
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
          where: { id },
          required: true,
        },
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'validade_oferta_id', 'produto_id'],
      },
    })
    return res.json(ofertas)
  }
}

export default new ValidadeOfertaController()
