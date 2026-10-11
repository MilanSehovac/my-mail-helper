'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('campaigns', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      target: {
        type: Sequelize.STRING,
        allowNull: false
      },
      template_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      send_mode: {
        type: Sequelize.ENUM('scheduled', 'immediate'),
        allowNull: false,
        defaultValue: 'scheduled'
      },
      daily_limit: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30
      },
      sent: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      total: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('Sending', 'Completed', 'Paused'),
        allowNull: false,
        defaultValue: 'Paused'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('campaigns');
  }
};
