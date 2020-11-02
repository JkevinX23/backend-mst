module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('categoria_produto', {
      produto_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'produtos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
      },

      categoria_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'categoria', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    })
  },

  down: queryInterface => {
    return queryInterface.dropTable('categoria_produto')
  },
}
