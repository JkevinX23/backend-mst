"use strict";/* eslint-disable */
const { address } = require('faker')
const faker = require('faker')

faker.locale = 'pt_BR'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const data = []
    const data2 = []
    const date = new Date()

    let amount = 10
    // eslint-disable-next-line no-plusplus
    while (amount--) {
      data.push({
        logradouro: faker.address.streetName(),
        numero: faker.random.number(),
        complemento: faker.address.secondaryAddress(),
        cidade: faker.address.city(),
        estado: faker.address.state(),
        bairro: faker.random.word(),
        cep: faker.random.number(),
        created_at: date,
        updated_at: date,
      })
    }
    let id_end
    try {
      id_end = await queryInterface.bulkInsert('enderecos', data, {})
    } catch (error) {
      console.log(error)
    }
    data.forEach((element, index) => {
      data2.push({
        nome: faker.name.firstName(),
        email: faker.internet.email(),
        cpf: faker.random.number(),
        endereco_id: index + id_end,
        telefone: faker.random.number(),
        password_hash: faker.internet.password(),
        created_at: date,
        updated_at: date,
      })
    })

    return queryInterface.bulkInsert('clientes', data2, {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('enderecos', null, {})
    await queryInterface.bulkDelete('clientes', null, {})
  },
}
