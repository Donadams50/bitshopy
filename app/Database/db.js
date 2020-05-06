const mysql = require('mysql2/promise');
const dbConfig = require("./db.config");
// Create Connection to the database
const db = mysql.createPool({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
    waitForConnections:dbConfig.waitForConnections,
    queueLimit:dbConfig.queueLimit
});
// console.log(db)
if(db.state === 'disconnected'){
    console.log('Server Down')
}else{
    console.log('Connected with database') 
}
const connection = db;

module.exports = connection;