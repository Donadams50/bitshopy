module.exports = app =>{
    const member = require("../Members/members.controller");
  //  const authentication = require('../Helpers/authentication')
   const jwtTokenUtils = require('../Helpers/jwtTokenUtils')
   const { verifyToken } = jwtTokenUtils;
    // Create a new community
    app.post("/member", member.create); 

       // to register new organization
      app.get("/verifyuser", member.verifyEmail)
    

       // Sign In member
    app.post("/authenticateuser", member.signIn); 

    app.post("/forgotpassword", member.forgotPassword); 
    
    app.post("/setnewpassword", member.setnewPassword); 

    app.post("/changeemail",  verifyToken,  member.changeEmail); 

    app.post("/changepassword", verifyToken,  member.changePassword); 

    app.get("/user/:id", verifyToken,  member.getUser);

    app.post("/twofactorauth", verifyToken,  member.enableTwoFactor); 

    app.post("/rate", verifyToken,  member.Rate);

   app.post("/twofactorcode", verifyToken,  member.validateTwoFactor); 
    // Sign In member
  //  app.post("/user_auth", member.signIn); 

    // // Get a member by Id
    // app.get("/members/:memberId", verifyToken, member.findOne)

    // // get all members
    // app.get("/members", verifyToken, member.findAll)

    //  // check username availablity
    //  app.get("/members/name/availability/:username", member.findUsername)

     
}