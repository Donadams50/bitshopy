module.exports = app =>{
    const member = require("../Members/members.controller");
  //  const authentication = require('../Helpers/authentication')
  //  const jwtTokenUtils = require('../Helpers/jwtTokenUtils')
  //  const { verifyToken } = jwtTokenUtils;
    // Create a new community
    app.post("/member", member.create); 

       // to register new organization
       app.get("/verification", member.verifyEmail)
    

       // Sign In member
    app.post("/authenticateuser", member.signIn); 
    // Sign In member
  //  app.post("/user_auth", member.signIn); 

    // // Get a member by Id
    // app.get("/members/:memberId", verifyToken, member.findOne)

    // // get all members
    // app.get("/members", verifyToken, member.findAll)

    //  // check username availablity
    //  app.get("/members/name/availability/:username", member.findUsername)

    // //  update a member
    // app.put("/members", verifyToken, member.updateMember)

    // // Update member roles
    // app.post('/members/roles', verifyToken, member.updateRole)

    // // Count members
    // app.get('/members/count/memberCount', member.count)

    // // reset password
    // app.post("/members/resetPassword", verifyToken, member.resetPassword)

    // forgot password
    // app.post("/members/forgotpassword", member.forgotPassword)    
}