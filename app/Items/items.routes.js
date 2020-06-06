module.exports = app =>{
    const item = require("../Items/items.controller");
  //  const authentication = require('../Helpers/authentication')
    const jwtTokenUtils = require('../Helpers/jwtTokenUtils')
    const { verifyToken } = jwtTokenUtils;
    // get wish list details
    app.post("/getwishlistdetails", verifyToken, item.create); 
   // post wish list
    app.post("/offer", verifyToken, item.createOffer); 
  
    // get all offer  
    app.get("/alloffer", verifyToken, item.getAllOffer)
    
// get all offer without login
    app.get("/nonuseroffer", item.getAllOfferNoLogin)
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

    // shopper cancel offer before earner accept
    app.get("/shoppercanceloffer/:offerId", verifyToken, item.shopperCancelOffer);

    app.get("/confirmdelivery/:offerId", verifyToken, item.shopperConfirmDelivery);

    // earner cancel offer after it has been accepted
    app.post("/earnercanceloffer", verifyToken, item.earnerCancelOffer);

    app.get("/getallunread", verifyToken, item.getUnread);

    app.get("/markread/:wishlistTableId", verifyToken, item.markRead);

    app.post("/notification", verifyToken, item.sendMessage);

    app.post("/modifyoffer", verifyToken, item.modifyOffer);

    app.get("/btcrate",  item.getBtcRate)
    



     
}