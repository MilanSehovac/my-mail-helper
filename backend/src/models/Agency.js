import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Agency = sequelize.define('Agency', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // nullable only so pre-ownership rows survive migration; the API always sets it
        references: {
            model: 'users',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    city: DataTypes.STRING,
    website: DataTypes.STRING,
    segment_tag: DataTypes.STRING,
    status: {
        type: DataTypes.ENUM(
            'Research',
            'First Contact',
            'First Follow-up',
            'Second Follow-up',
            'Third Follow-up',
            'interview',
            'Rejected',
            'Accepted',
            'Ghosted'
        ),
        defaultValue: 'Research'
    },
    counter: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_contact: {
        type: DataTypes.DATE,
        allowNull: true
    },
    comment: DataTypes.TEXT
}, {
    tableName: 'agencies',
    underscored: true
});

export default Agency;