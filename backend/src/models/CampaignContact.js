import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// One row per (campaign, contact): the source of truth for a recipient's delivery state.
// Pending -> Sending (claimed by a worker) -> Sent | Failed | Skipped. Replied/Bounced/Opened need provider events.
const CampaignContact = sequelize.define('CampaignContact', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    campaign_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    contact_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Sending', 'Sent', 'Failed', 'Skipped', 'Opened', 'Replied', 'Bounced'),
        allowNull: false,
        defaultValue: 'Pending'
    },
    sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'sent_at'
    },
    claimed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    // Set while a transient failure is waiting to be retried
    next_attempt_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_error: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    provider_message_id: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'campaign_contacts',
    timestamps: true,
    underscored: true,
    indexes: [
        { unique: true, fields: ['campaign_id', 'contact_id'], name: 'campaign_contacts_unique_recipient' }
    ]
});

export default CampaignContact;
