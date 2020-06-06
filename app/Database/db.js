const mysql = require('mysql2/promise');
const dbConfig = require("./db.config");
const dotenv=require('dotenv');

dotenv.config();
// Create Connection to the database
 const db = mysql.createPool(
//    {
  

//     host:process.env.HOST,
//     user :process.env.USER,
//     password: process.env.PASSWORD,
//     database: process.env.DB,
//     waitForConnections:dbConfig.waitForConnections,
//     conectionLimit:dbConfig.conectionLimit,
//     queueLimit:dbConfig.queueLimit

// }
 process.env.CLEARDB_DATABASE_URL
);
// console.log(db)
if(db.state === 'disconnected'){
    console.log('Server Down')
}else{
    console.log('Connected to database') 
}
const connection = db;

module.exports = connection;