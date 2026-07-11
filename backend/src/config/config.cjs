const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
development: {
username: process.env.DB_USER || 'root',
password: process.env.DB_PASS || null,
database: process.env.DB_NAME || 'mailing_tracker',
host: process.env.DB_HOST || '127.0.0.1',
dialect: 'mysql',
define: {
underscored: true
}
},
production: {
username: process.env.DB_USER,
password: process.env.DB_PASS,
database: process.env.DB_NAME,
host: process.env.DB_HOST,
dialect: 'mysql'
}
};