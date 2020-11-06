module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('oferta', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      produto_id: {
        type: Sequelize.INTEGER,
        references: { model: 'produtos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
      },

      quantidade: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      valor_unitario: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
      },

      validade_oferta_id: {
        type: Sequelize.INTEGER,
        references: { model: 'validade_oferta', key: 'id' },
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
    return queryInterface.dropTable('oferta')
  },
}
