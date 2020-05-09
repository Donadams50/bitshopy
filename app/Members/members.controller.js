const Members = require('../Members/members.model.js');
const Items = require('../Items/items.model.js');
//const Consultant = require('../Consultants/consultant.model');
// const Community = require('../Community/community.model.js')
// const Claims = require('../Claims/claims.model')
// const Subscription = require('../Subscription/subscription.model')
 const passwordUtils =require('../Helpers/passwordUtils');
 const jwtTokenUtils = require('../Helpers/jwtTokenUtils')
const sendemail = require('../Helpers/emailhelper.js');
// const Notify = require('../Helpers/notifications.js')
 const { signToken } = jwtTokenUtils;
const uuid = require('uuid')


// create member
exports.create = async(req,res)=>{
    if (!req.body){
        res.status(400).send({message:"Content cannot be empty"});
    }
console.log(req.body)
    const { username,  email, password } = req.body;
    if (username  && email &&password){
        if (username==="" || email==="" || password===""){
            res.status(400).send({
                message:"Incorrect entry format"
            });
        }else{
            const member = new Members ({
                username:username,
                email:email.toLowerCase(), 
                password:password,
                isVerified: false,
                code: uuid.v4(),
                ratings: 0,
                noOfRatings: 0,
                walletBalanceUsd:0.0,
                walletBalanceBtc: 0.0,
                level: 1,
                noOfTransactions:0

            });
            try{
                // check if user exists
                const isUserExist = await Members.findByUsername(req.body.username, req.body.email.toLowerCase() )
                if (isUserExist.length>0){
                    res.status(400).send({message:"Username OR Email already exists"})
                }else{
                    const countMembers =  await Members.countMembers()
                    if (countMembers.length>= 30){
                        member.level = 1
                    }else{
                        member.level= 0;
                    }
                        member.password = await passwordUtils.hashPassword(req.body.password.toLowerCase());
                        const emailFrom = 'Bitshopy   <noreply@astrapay.com.com>';
                        const subject = 'Verification link';                      
                      //  const hostUrl = " 192.168.43.70:8080"
                        const hostUrl2 = "http://boring-snyder-80af72.netlify.app/#" 
                          const hostUrl = "boring-snyder-80af72.netlify.app/#"
                        const to = req.body.username;
                        const emailTo = req.body.email.toLowerCase();
                        const link = `${hostUrl}/verifyuser?code=${member.code}&username=${to}`;
                        const link2 = `${hostUrl2}/verifyuser?code=${member.code}&username=${to}`;
                        sentemail =  await  processEmail(emailFrom, emailTo, subject, link, link2);
                          console.log(sentemail)
                    if(sentemail === true){
                     
                        const savedmember =await Members.create(member)
                        if (savedmember.insertId>0){ 
                            res.status(201).send({message:"member created"})
                        }else{
                            res.status(500).send({message:"Error while creating member "})
                        }
                    }
                  else{
                    res.status(500).send({message:"Error while creating member "})
                 console.log("Email not sent , network error");
                  }
                       
                  
                    
                }
            }catch(err){
                console.log(err)
                res.status(500).send({message:"Error while creating member "})
            }
        }
    }else{
        res.status(400).send({
            message:"Incorrect entry format"
        });
    }
}

// verify email
exports.verifyEmail = async(req, res) =>{

    try{
       
        let {code , username} = req.query;
    console.log(code)
    console.log(username)
        if (username ==="" || code ===""){
            res.status(400).send({message:"user id not provided"}) 
        }else{

         const verifyemail = await Members.getToken(username , code)
            if (verifyemail.length > 0){
              //  console.log(verifyemail[0])
                if(verifyemail[0].isVerified === 1){
                    res.status(409).send({message:"this user has been verified ",  verifyemail});
                    

                }else{
                    const isVerified = true;
                    const verify = await Members.verifyEmail(username , code, isVerified)
                    console.log(verify)
                    res.status(200).send({message: "Congratulations!! Your email have been verified"})

                }

               
             
            }
            
            else{
                res.status(400).send({message:"issues while verifying email"}) 
            }
        }
           
          
        }
       
    catch(err){
      console.log(err)
        res.status(500).send({message:"issues while verifying email"})
        
    }
  
    
}
// process email
async function processEmail(emailFrom, emailTo, subject, text, text2 ){
    try{
        //create org details
        // await delay();
       const sendmail =  await sendemail.emailUtility(emailFrom, emailTo, subject, text, text2);
     //  console.log(sendmail)
        return sendmail
    }catch(err){
        console.log(err)
        return err
    }

}

// User signIn
exports.signIn = async(req,res)=>{
    console.log(req.body)
    if (!req.body){
        res.status(400).send({message:"Content cannot be empty"})
    }
    const { email, password} = req.body
    if (email && password ){
        if (email===""||password===""){
            res.status(400).send({message:"Required fields cannot be empty"})
        }else{
            try{
                const user = await Members.findByEmail(email.toLowerCase())
                console.log(user)
                if (user.length<1){
                    res.status(404).send({message:"User not found"})
                }else{
                    const retrievedPassword = user[0].password
                    const userDetails = await Members.findDetailsByEmail(req.body.email.toLowerCase())
                    //console.log(userDetails)
                    const {id , username,  email, level}= userDetails[0]
                    const isMatch = await passwordUtils.comparePassword(password.toLowerCase(), retrievedPassword);
                    console.log(isMatch)
                    if (isMatch){
                        const tokens = signToken(id, username, email, level) 
                         const user = userDetails[0]
                          const getPriviledges = await Members.findLevelDetails(userDetails[0].level)
                         
                          const noOfOffer = await Items.findNumberOfOffer(userDetails[0].id)
                          if ( userDetails[0].noOfTransactions > 5 || noOfOffer <= 10  ){
                            user.makeoffer=true
                          }
                          if ( userDetails[0].noOfTransactions >= getPriviledges[0].transactionLimit  ){
                            user.transactionLimit=true
                          }

                        user.priviledges=getPriviledges[0]
                        user.token = tokens
                        res.status(200).send(user)
                    }else{
                        res.status(400).json({message:"Incorrect Login Details"})
                    }
                }
                
            }catch(err){
                console.log(err)
                res.status(500).json(err)
            }  
        }
    }else{
        res.status(500).send({message:"Enter the required fields"})
    }
    
}

exports.forgotPassword = async(req,res)=>{
    let {email, username} = req.body
    console.log(username)
    console.log(email)
    try{
        const isCred = await Members.findByEmail(email.toLowerCase())
        const isMember = await Members.findDetailsByEmail(email.toLowerCase())
        console.log(isCred)
        console.log(isMember)
        if (isCred.length>0 && isMember.length>0){
            //const randomstring = Math.random().toString(36).slice(-8); 
            // console.log('random string is '+ randomstring)
            //newpassword = await passwordUtils.hashPassword(randomstring.toLowerCase());
           // const updatePassword = await Members.updatePassword(username, newpassword)
           const code = uuid.v4()
           const emailFrom = 'Bitshopy   <noreply@astrapay.com.com>';
           const subject = 'Forgot password';                      
         // const hostUrl = " 192.168.43.70:8080"
        const hostUrl2 = "http://boring-snyder-80af72.netlify.app/#" 
        const hostUrl = "boring-snyder-80af72.netlify.app/#" 
           const to = req.body.username;
           const emailTo = req.body.email.toLowerCase();
           const link = `${hostUrl}/forgotpasswordverification?email=${emailTo}&username=${to}&code=${code}`;
           const link2 = `${hostUrl2}/forgotpasswordverification?email=${emailTo}&username=${to}&code=${code}`;
           sentemail =  await  processEmail(emailFrom, emailTo, subject, link, link2);
             console.log(sentemail)
       if(sentemail === true){
        const saveForgetPasswordCode = await Members.saveForgetPasswordCode(email.toLowerCase() , code)
        console.log(saveForgetPasswordCode)
        if (saveForgetPasswordCode.affectedRows===1){
         
            res.status(201).send({message:" Verification Email sent "})
        }else{
            res.status(500).send({message:"Error saving forgot password code."})
        }   
        
          
       }
     else{
    console.log("Email not sent , network error");
     }
          
     
       
        }else{
            res.status(400).send('User does not exist')
        }
        
    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
}

// set new password

exports.setnewPassword = async(req,res)=>{
    let {email, username, password, code} = req.body
    console.log(username)
    console.log(email)
    console.log(password)
    try{
        const isCred = await Members.findByEmail(email.toLowerCase())
        const isMember = await Members.findDetailsByEmail(email.toLowerCase())
        if (isCred.length>0 && isMember.length>0){
            const isCodeValid = await Members.findForgotPasswordCod(code,email.toLowerCase())
            if (isCodeValid.length>0){
            newpassword = await passwordUtils.hashPassword(password.toLowerCase());
           const updatePassword = await Members.updatePassword(email.toLowerCase(), newpassword)
           if (updatePassword.affectedRows===1){
            const clearForgotPasswordCode = await Members.clearForgotPasswordCode(code, email.toLowerCase())  
                res.status(200).send({message:"Password updated"})
                    }else{
                        res.status(500).send({message:"Password forgot not updated"})
                    }   
                        
                }else{
                    res.status(400).send({message:"Forgot password code not valid"})
                }
       
        }else{
            res.status(400).send('User does not exist')
        }
        
    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
}