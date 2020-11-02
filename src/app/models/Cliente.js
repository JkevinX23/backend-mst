import Sequelize, { Model } from 'sequelize'
import bcrypt from 'bcryptjs'

class Cliente extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,
        email: Sequelize.STRING,
        cpf: Sequelize.INTEGER,
        telefone: Sequelize.INTEGER,
        password_hash: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
      },
      {
        sequelize,
        tableName: 'clientes',
      },
    )

    this.addHook('beforeSave', async admin => {
      if (admin.password) {
        admin.password_hash = await bcrypt.hash(admin.password, 8)
      }
    })

    return this
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash)
  }

  static associate(models) {
    this.belongsTo(models.Enderecos, {
      foreignKey: 'endereco_id',
    })
  }
}

export default Cliente
