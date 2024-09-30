module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Requests', 'datetime', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Requests', 'datetime', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};

