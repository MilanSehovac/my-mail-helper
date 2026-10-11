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
        type: Sequelize.STRING,
        allowNull: false
      },
      city: {
        type: Sequelize.STRING
      },
      website: {
        type: Sequelize.STRING
      },
      segment_tag: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('Research', 'First Contact', 'First Follow-up', 'Second Follow-up', 'Third Follow-up','interview', 'Rejected', 'Accepted', 'Ghosted'),
        defaultValue: 'Research'
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
