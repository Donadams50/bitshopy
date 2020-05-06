// import packages into the app. Express, body-parser, 
//const sql=require("./app/Database/db")
const express = require('express');
const app = express();
const bodyparser = require('body-parser');
app.use(bodyparser.json());
const cors = require("cors");
const uuid = require('uuid')
app.use(cors()); 
const path = require('path')
const fileUpload=require('express-fileupload')
app.use(fileUpload())
// set static folder
app.use(express.static(path.join(__dirname, 'public')));
const axios = require('axios')



// require("./app/Community/community.routes.js")(app) 
 require("./app/Members/members.routes.js")(app)
// require("./app/Claims/claims.routes.js")(app)
// require("./app/Consultants/consultant.routes.js")(app)
// require("./app/Subscription/subscription.routes.js")(app)
// require("./app/Consultants/consultant.routes")(app)
// require("./app/Requests/requests.routes")(app)
// require("./app/Transactions/transactions.routes")(app)
// require("./app/Notifications/notification.routes")(app)


// Connect to port
const port = process.env.PORT || 3000     

app.listen(port, ()=> console.log(`listening on port ${port}...`)); 