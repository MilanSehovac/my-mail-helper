import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Agency = sequelize.define('Agency', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.ENUM('HR', 'SRB', 'BiH', 'CG'),
        allowNull: false
    },
    city: DataTypes.STRING,
    website: DataTypes.STRING,
    focus_tags: DataTypes.STRING,
    status: {
        type: DataTypes.ENUM('Istraživanje', 'Poslat 1. mail', 'Poslat Follow-up', 'Intervju', 'Odbijen', 'Prihvaćen', 'Ghostovan'),
        defaultValue: 'Istraživanje'
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