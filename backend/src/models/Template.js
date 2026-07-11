import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Template = sequelize.define('Template', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
}, {
    tableName: 'templates',
    timestamps: false
});

export default Template;