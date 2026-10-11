'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('billing_settings', {
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
      stripe_customer_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      subscription_plan: {
        type: Sequelize.ENUM('free', 'pro', 'enterprise'),
        allowNull: false,
        defaultValue: 'free'
      },
      billing_email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      card_last_four: {
        type: Sequelize.STRING,
        allowNull: true
      },
      card_expiry: {
        type: Sequelize.STRING,
        allowNull: true
      },
      next_billing_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      auto_renew: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.dropTable('billing_settings');
  }
};
