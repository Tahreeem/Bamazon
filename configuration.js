require('dotenv').config();

let config = {
    dbusername: process.env.dbusername,
    dbpassword: process.env.dbpassword,
    dbhost: process.env.dbhost,
    dbport: process.env.dbport
};

module.exports = config;