module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Requests', 'location', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Requests', 'location', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};
