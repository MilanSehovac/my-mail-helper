import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const BillingSettings = sequelize.define('BillingSettings', {
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
    stripe_customer_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    subscription_plan: {
        type: DataTypes.ENUM('free', 'pro', 'enterprise'),
        allowNull: false,
        defaultValue: 'free'
    },
    billing_email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    card_last_four: {
        type: DataTypes.STRING,
        allowNull: true
    },
    card_expiry: {
        type: DataTypes.STRING,
        allowNull: true
    },
    next_billing_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    auto_renew: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'billing_settings',
    underscored: true
})

export default BillingSettings