module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('produtos', 'imagem_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('produtos', 'imagem_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),
    ])
  },
}
