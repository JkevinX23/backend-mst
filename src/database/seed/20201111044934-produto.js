/* eslint-disable */
const { query } = require('express')
const { address } = require('faker')
const faker = require('faker')

faker.locale = 'pt_BR'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const data = []
    const data2 = []
    const data3 = []
    const data4 = []
    const data5 = []
    const date = new Date()
    const totalAmount = 70
    let amount = totalAmount
    // eslint-disable-next-line no-plusplus
    while (amount--) {
      data.push({
        nome: faker.commerce.productName(),
        descricao: faker.commerce.productDescription(),
        imagem_id: 1,
        created_at: date,
        updated_at: date,
      })
    }

    amount = totalAmount

    // eslint-disable-next-line no-plusplus
    while (amount--) {
      data2.push({
        nome: faker.unique(faker.commerce.productName),
        created_at: date,
        updated_at: date,
      })
    }
    let a
    let b
    let c
    try {
      a = await queryInterface.bulkInsert('produtos', data, {})
    } catch (error) {
      console.log('error')
    }

    try {
      b = await queryInterface.bulkInsert('categoria', data2, {})
    } catch (error) {
      console.log(error)
      return
    }

    amount = totalAmount
    console.log(`${a} ${b}`)
    a--
    b--
    while (amount--) {
      data3.push({
        produto_id: ++a,
        categoria_id: ++b,
        created_at: date,
        updated_at: date,
      })
    }
    amount = totalAmount
    a -= amount - 1
    await queryInterface.bulkInsert('categoria_produto', data3, {})

    let amount_validade = 3
    while (amount_validade--) {
      data4.push({
        validade: faker.date.soon(),
        status: 'ativa',
        created_at: date,
        updated_at: date,
      })
    }
    amount_validade = 3
    try {
      c = await queryInterface.bulkInsert('validade_oferta', data4, {})
    } catch (error) {
      console.log(error)
    }
    amount = totalAmount
    while (amount--) {
      data5.push({
        produto_id: Math.floor(Math.random() * totalAmount) + a,
        quantidade: faker.random.number(),
        valor_unitario: faker.random.float(),
        validade_oferta_id: Math.floor(Math.random() * amount_validade) + c,
        created_at: date,
        updated_at: date,
      })
    }
    await queryInterface.bulkInsert('oferta', data5, {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categoria_produto', null, {})
    await queryInterface.bulkDelete('produtos', null, {})
    await queryInterface.bulkDelete('categoria', null, {})
    await queryInterface.bulkDelete('validade_oferta', null, {})
    await queryInterface.bulkDelete('oferta', null, {})
  },
}
