'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Jobs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      job_id: {
        type: Sequelize.UUID,
        defaultValue: null,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      state: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      result: {
        type: Sequelize.INTEGER,//adaptado a workers/sum
        defaultValue: null
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      },
    });
  },
  async down(queryInterface, Sequelize) {
    console.log(Sequelize);
    await queryInterface.dropTable('Jobs');
  }
};