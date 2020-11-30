module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('tipo_frete', 'valor_frete', {
        type: Sequelize.FLOAT,
        allowNull: false,
      }),
    ])
  },

  down: queryInterface => {
    return Promise.all([
      queryInterface.removeColumn('tipo_frete', 'valor_frete'),
    ])
  },
}
