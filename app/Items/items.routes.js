module.exports = app =>{
    const item = require("../Items/items.controller");
  //  const authentication = require('../Helpers/authentication')
    const jwtTokenUtils = require('../Helpers/jwtTokenUtils')
    const { verifyToken } = jwtTokenUtils;
    // Create a new item
    app.post("/getwishlistdetails", verifyToken, item.create); 

    app.post("/offer", verifyToken, item.createOffer); 
  
    // get all members
    
    app.get("/alloffer", verifyToken, item.getAllOffer)


    // offer qualified for
    app.get("/useroffer", verifyToken, item.getAllOfferQualifiedFor)

    // all items in a offer qualified for
    app.get("/itemsoffer/:offerId", verifyToken, item.getAllItemsInOffer)
    // accept offer
    app.post("/acceptoffer", verifyToken, item.acceptOffer);
    // first step of accepting offer , if the user does not purchase after 30 mins , it will be cancelled
    app.get("/temporaryacceptoffer/:offerId", verifyToken, item.acceptOfferTemp);
    // cancel temporary offer if user does not purchase within 30 minutes of accepting
    app.get("/canceltemporaryoffer/:offerId", verifyToken, item.cancelOfferTemp);

    app.get("/allorder", verifyToken, item.getOrder)

    app.get("/btcrate",  item.getBtcRate)
    



     
}