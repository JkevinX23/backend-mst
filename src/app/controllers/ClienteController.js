import * as Yup from 'yup'
import Cliente from '../models/Cliente'
import Autorizacao from '../models/Autorizacao'
import TipoUsuarios from '../models/TipoUsuarios'
import Enderecos from '../models/Enderecos'

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

    const exists = await Autorizacao.findOne({ where: { email } })
    if (exists) {
      return res.status(400).json({ error: 'Email already exists.' })
    }

    let transaction
    try {
      transaction = await Cliente.sequelize.transaction()
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

      const end = await Enderecos.create(endereco, { transaction })

      const client = {
        nome,
        email,
        password,
        cpf,
        telefone,
        endereco_id: end.id,
      }

      const cliente = await Cliente.create(client, { transaction })

      let tipo = await TipoUsuarios.findOne({
        where: { tipo: 'cliente' },
      })

      if (!tipo) {
        tipo = await TipoUsuarios.create({ tipo: 'cliente' }, { transaction })
      }
      await Autorizacao.create(
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
}

export default new ClienteController()
