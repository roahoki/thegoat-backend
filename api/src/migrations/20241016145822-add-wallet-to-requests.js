module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Requests', 'wallet', {
      type: Sequelize.BOOLEAN,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    console.log(Sequelize);
    await queryInterface.removeColumn('Requests', 'wallet');
  }
};

