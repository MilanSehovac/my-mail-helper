'use strict';

/**
 * - Adds per-user ownership (user_id) to agencies and contacts. Rows created before this migration
 *   keep user_id = NULL and are no longer returned by the API; assign them manually, e.g.
 *   UPDATE agencies SET user_id = 1 WHERE user_id IS NULL;  (same for contacts)
 * - Contact consent/suppression columns.
 * - Delivery tracking columns + unique recipient constraint on campaign_contacts.
 * - Fixes contacts.tag NOT NULL (the API allows an empty tag), widens templates.category and smtp password.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up (queryInterface, Sequelize) {
    const owner = {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    };
    await queryInterface.addColumn('agencies', 'user_id', owner);
    await queryInterface.addColumn('contacts', 'user_id', owner);
    await queryInterface.addIndex('agencies', ['user_id']);
    await queryInterface.addIndex('contacts', ['user_id']);
    await queryInterface.addIndex('contacts', ['agency_id']);

    await queryInterface.changeColumn('contacts', 'tag', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('contacts', 'source', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('contacts', 'unsubscribed_at', { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn('contacts', 'suppression_reason', { type: Sequelize.STRING, allowNull: true });

    await queryInterface.changeColumn('templates', 'category', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.changeColumn('smtp_settings', 'smtp_password', { type: Sequelize.TEXT, allowNull: true });

    await queryInterface.changeColumn('campaigns', 'status', {
      type: Sequelize.ENUM('Scheduled', 'Sending', 'Completed', 'Paused'),
      allowNull: false,
      defaultValue: 'Paused'
    });
    await queryInterface.addIndex('campaigns', ['status', 'scheduled_at']);

    await queryInterface.changeColumn('campaign_contacts', 'status', {
      type: Sequelize.ENUM('Pending', 'Sending', 'Sent', 'Failed', 'Skipped', 'Opened', 'Replied', 'Bounced'),
      allowNull: false,
      defaultValue: 'Pending'
    });
    await queryInterface.addColumn('campaign_contacts', 'claimed_at', { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn('campaign_contacts', 'attempts', { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 });
    await queryInterface.addColumn('campaign_contacts', 'last_error', { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('campaign_contacts', 'provider_message_id', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addIndex('campaign_contacts', ['campaign_id', 'contact_id'], {
      unique: true,
      name: 'campaign_contacts_unique_recipient'
    });
    await queryInterface.addIndex('campaign_contacts', ['campaign_id', 'status']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('campaign_contacts', ['campaign_id', 'status']);
    await queryInterface.removeIndex('campaign_contacts', 'campaign_contacts_unique_recipient');
    for (const col of ['provider_message_id', 'last_error', 'attempts', 'claimed_at']) {
      await queryInterface.removeColumn('campaign_contacts', col);
    }
    await queryInterface.changeColumn('campaign_contacts', 'status', {
      type: Sequelize.ENUM('Pending', 'Sent', 'Opened', 'Replied', 'Bounced'),
      allowNull: false,
      defaultValue: 'Pending'
    });

    await queryInterface.removeIndex('campaigns', ['status', 'scheduled_at']);
    await queryInterface.changeColumn('campaigns', 'status', {
      type: Sequelize.ENUM('Sending', 'Completed', 'Paused'),
      allowNull: false,
      defaultValue: 'Paused'
    });

    await queryInterface.changeColumn('smtp_settings', 'smtp_password', { type: Sequelize.STRING, allowNull: true });
    for (const col of ['suppression_reason', 'unsubscribed_at', 'source']) {
      await queryInterface.removeColumn('contacts', col);
    }
    await queryInterface.removeIndex('contacts', ['agency_id']);
    await queryInterface.removeIndex('contacts', ['user_id']);
    await queryInterface.removeIndex('agencies', ['user_id']);
    await queryInterface.removeColumn('contacts', 'user_id');
    await queryInterface.removeColumn('agencies', 'user_id');
  }
};
