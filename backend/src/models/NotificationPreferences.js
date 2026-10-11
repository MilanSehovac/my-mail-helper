import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const NotificationPreferences = sequelize.define('NotificationPreferences', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    campaign_complete: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    new_reply: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    weekly_digest: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    bounce_alert: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'notification_preferences',
    underscored: true
})

export default NotificationPreferences