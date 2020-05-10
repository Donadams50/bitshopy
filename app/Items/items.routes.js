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
    app.post("/acceptoffer", verifyToken, item.accepteOffer);
    

 

    // // Get a member by Id
    // app.get("/members/:memberId", verifyToken, member.findOne)

    // // get all members

    //  // check username availablity
    //  app.get("/members/name/availability/:username", member.findUsername)

     
}