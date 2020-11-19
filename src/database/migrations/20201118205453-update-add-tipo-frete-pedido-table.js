module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'pedidos', // table name
        'tipo_frete_id', // new field name
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'tipo_frete', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
      ),
    ])
  },

  down(queryInterface) {
    // logic for reverting the changes
    return Promise.all([
      queryInterface.removeColumn('pedidos', 'tipo_frete_id'),
    ])
  },
}
