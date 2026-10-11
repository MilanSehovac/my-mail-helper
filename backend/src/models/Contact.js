import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Contact = sequelize.define('Contact', {
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
    agency_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'agencies',
            key: 'id'
        }
    },
    full_name: DataTypes.STRING,
    position: DataTypes.STRING,
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true }
    },
    status:{
      type:DataTypes.ENUM('Subscribed', 'Unsubscribed', 'Bounced'),
      allowNull:false,
      defaultValue:'Subscribed'
    },
    tag: DataTypes.STRING,
    // Where the address came from (e.g. "manual", "website", "linkedin") - needed for consent audits
    source: DataTypes.STRING,
    unsubscribed_at: DataTypes.DATE,
    suppression_reason: DataTypes.STRING
}, {
    tableName: 'contacts',
    underscored: true
});

export default Contact;
