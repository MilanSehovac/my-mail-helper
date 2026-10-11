import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { encryptSecret } from "../utils/secrets.js";

const SmtpSettings = sequelize.define('SmtpSettings', {
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
    smtp_host: {
        type: DataTypes.STRING,
        allowNull: true
    },
    smtp_port: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    smtp_user: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // Stored encrypted (AES-256-GCM). Use decryptSecret() only when connecting to the SMTP server.
    smtp_password: {
        type: DataTypes.TEXT,
        allowNull: true,
        set(value) {
            this.setDataValue('smtp_password', encryptSecret(value));
        }
    },
    from_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    from_email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_configured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'smtp_settings',
    underscored: true
})

export default SmtpSettings
