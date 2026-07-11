import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Contact = sequelize.define('Contact', {
    agency_id:{
      type: DataTypes.INTEGER,
        allowNull: false,
    },
    full_name: DataTypes.STRING,
    position: DataTypes.STRING,
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true }
    }
}, {
    tableName: 'contacts',
    timestamps: false
});

export default Contact;