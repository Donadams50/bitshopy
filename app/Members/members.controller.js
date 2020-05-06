const Members = require('../Members/members.model.js');
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
                email:email, 
                password:password,
                isVerified: false,
                code: uuid.v4(),
                ratings: 0,
                noOfRatings: 0,
                walletBalanceUsd:0.0,
                walletBalanceBtc: 0.0,
                level: 1

            });
            try{
                // check if user exists
                const isUserExist = await Members.findByUsername(req.body.username, req.body.email )
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
                        const hostUrl = " 192.168.1.113:3000"
                        const to = req.body.username;
                        const emailTo = req.body.email;
                        const link = `${hostUrl}/verification?code=${member.code}&username=${to}`;
                        sentemail =  await  processEmail(emailFrom, emailTo, subject, link);
                          console.log(sentemail)
                    if(sentemail === true){
                     
                        const savedmember =await Members.create(member)
                        if (savedmember.insertId>0){ 
                            res.status(201).send({message:"member created"})
                        }else{
                            res.status(400).send({message:"Error while creating member "})
                        }
                    }
                  else{
                 console.log("Email not sent , network error");
                  }
                       
                  
                    
                }
            }catch(err){
                console.log(err)
                res.status(400).send({message:"Error while creating member "})
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
                    res.status(200).send({message:"this user has been verified ",  verifyemail});
                    

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
async function processEmail(emailFrom, emailTo, subject, text ){
    try{
        //create org details
        // await delay();
       const sendmail =  await sendemail.emailUtility(emailFrom, emailTo, subject, text);
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
                const user = await Members.findByEmail(email)
                console.log(user)
                if (user.length<1){
                    res.status(404).send({message:"User not found"})
                }else{
                    const retrievedPassword = user[0].password
                    const userDetails = await Members.findDetailsByEmail(req.body.email)
                    const {id , username,  email}= userDetails
                    const isMatch = await passwordUtils.comparePassword(password.toLowerCase(), retrievedPassword);
                    if (isMatch){
                        const tokens = signToken(id,username,email) 
                         const user = userDetails[0]
                        // const getPriviledges = await Members.findById(userDetails[0].Id)
                        // user.priviledges=getPriviledges[0].priviledges
                        user.token = tokens
                        res.status(200).send(user)
                    }else{
                        res.status(405).json({message:"Incorrect Login Details"})
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