module.exports = app =>{
    const payments = require("../Payments/payments.controller");
    const jwtTokenUtils = require('../Helpers/jwtTokenUtils')
    const { verifyToken } = jwtTokenUtils;

    app.get("/getaddress", verifyToken, payments.getAddress)

    app.post("/postfund", verifyToken, payments.postPayment)

    app.post("/withdrawfund", verifyToken, payments.withdrawPayment)


   

     
}