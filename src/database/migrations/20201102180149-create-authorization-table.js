module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('autorizacoes', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      tipo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tipo_usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      usuario_id: {
        type: Sequelize.INTEGER,
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
    return queryInterface.dropTable('autorizacoes')
  },
}
