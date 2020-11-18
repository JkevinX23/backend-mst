"use strict";/* eslint-disable */
const faker = require('faker')

faker.locale = 'pt_BR'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const data = []
    const data2 = []
    const date = new Date()
    const tipos = [
      { tipo: 'administrador', created_at: date, updated_at: date },
      { tipo: 'cliente', created_at: date, updated_at: date },
    ]
    let amount = 10
    // eslint-disable-next-line no-plusplus
    while (amount--) {
      data.push({
        nome: faker.name.firstName(),
        email: faker.internet.email(),
        password_hash: faker.internet.password(),
        created_at: date,
        updated_at: date,
      })
    }
    let a
    let id_tipo
    try {
      id_tipo = await queryInterface.bulkInsert('tipo_usuarios', tipos, {})
      a = await queryInterface.bulkInsert('Administradores', data, {})
    } catch (error) {
      console.log(error)
    }
    data.forEach((element, index) => {
      data2.push({
        email: element.email,
        tipo_id: id_tipo,
        usuario_id: index + a,
        created_at: date,
        updated_at: date,
      })
    })

    return queryInterface.bulkInsert('autorizacoes', data2, {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tipo_usuarios', null, {})
    await queryInterface.bulkDelete('autorizacoes', null, {})
    await queryInterface.bulkDelete('Administradores', null, {})
  },
}
