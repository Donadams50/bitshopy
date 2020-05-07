module.exports = app =>{
    const item = require("../Items/items.controller");
  //  const authentication = require('../Helpers/authentication')
    const jwtTokenUtils = require('../Helpers/jwtTokenUtils')
    const { verifyToken } = jwtTokenUtils;
    // Create a new item
    app.post("/item", verifyToken, item.create); 

    
    

 

    // // Get a member by Id
    // app.get("/members/:memberId", verifyToken, member.findOne)

    // // get all members
    // app.get("/members", verifyToken, member.findAll)

    //  // check username availablity
    //  app.get("/members/name/availability/:username", member.findUsername)

     
}