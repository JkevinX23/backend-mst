module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('pedidos', 'status', {
        type: Sequelize.ENUM('aberto', 'entregue', 'cancelado', 'fechado'),
        defaultValue: 'aberto',
        allowNull: false,
      }),
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('pedidos', 'status', {
        type: Sequelize.ENUM('aberto', 'entregue', 'cancelado'),
        defaultValue: 'aberto',
        allowNull: false,
      }),
    ])
  },
}
