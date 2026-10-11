'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('smtp_settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      smtp_host: {
        type: Sequelize.STRING,
        allowNull: true
      },
      smtp_port: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      smtp_user: {
        type: Sequelize.STRING,
        allowNull: true
      },
      smtp_password: {
        type: Sequelize.STRING,
        allowNull: true
      },
      from_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      from_email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_configured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('smtp_settings');
  }
};
