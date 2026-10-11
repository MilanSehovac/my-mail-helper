import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const CampaignAgency = sequelize.define('CampaignAgency', {
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
    agency_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'campaign_agencies',
    timestamps: true,
    underscored: true
});

export default CampaignAgency;