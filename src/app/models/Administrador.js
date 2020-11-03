import Sequelize, { Model } from 'sequelize'

import bcrypt from 'bcryptjs'

class Administrador extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,

        email: Sequelize.STRING,

        password_hash: Sequelize.STRING,

        password: Sequelize.VIRTUAL,
      },

      {
        sequelize,

        tableName: 'Administradores',
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
}

export default Administrador
