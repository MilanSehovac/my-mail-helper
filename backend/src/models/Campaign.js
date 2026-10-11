import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Campaign = sequelize.define('Campaign', {
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
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    target: {
        type: DataTypes.STRING,
        allowNull: false
    },
    template_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    scheduled_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    send_mode: {
        type: DataTypes.ENUM('scheduled', 'immediate'),
        allowNull: false,
        defaultValue: 'scheduled'
    },
    daily_limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30
    },
    sent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    total: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('Scheduled', 'Sending', 'Completed', 'Paused'),
        allowNull: false,
        defaultValue: 'Paused'
    }
},{
    tableName: 'campaigns',
    underscored: true
})

export default Campaign