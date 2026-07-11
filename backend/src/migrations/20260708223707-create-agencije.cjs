'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('agencies', {
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
      country: {
        type: Sequelize.ENUM('HR', 'SRB', 'BiH', 'CG'),
        allowNull: false
      },
      city: {
        type: Sequelize.STRING
      },
      website: {
        type: Sequelize.STRING
      },
      focus_tags: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('Istraživanje', 'Poslat 1. mail', 'Poslat Follow-up', 'Intervju', 'Odbijen', 'Prihvaćen', 'Ghostovan'),
        defaultValue: 'Istraživanje'
      },
      counter: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      last_contact: {
        type: Sequelize.DATE,
        allowNull: true
      },
      comment: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('agencies');
  }
};
