'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('campaign_contacts', 'next_attempt_at', { type: Sequelize.DATE, allowNull: true });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('campaign_contacts', 'next_attempt_at');
  }
};
