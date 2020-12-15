module.exports = {
  up: queryInterface => {
    return Promise.all([queryInterface.removeColumn('pedidos', 'valor_frete')])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('pedidos', 'valor_frete', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      }),
    ])
  },
}
