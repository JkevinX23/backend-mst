module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('clientes', 'telefone', {
        type: Sequelize.STRING,
        allowNull: false,
      }),
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('clientes', 'telefone', {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),
    ])
  },
}
