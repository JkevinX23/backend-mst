module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('produtos', 'item_ativo', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      }),
    ])
  },

  down: queryInterface => {
    return Promise.all([queryInterface.removeColumn('produtos', 'item_ativo')])
  },
}
