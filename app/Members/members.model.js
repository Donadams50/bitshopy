const sql=require("../Database/db");
// constructor for members
const Members = function(members){
    this.username=members.username
    this.code=members.code
    this.email=members.email
    this.level=members.level
    this.isVerified=members.isVerified
    this.password=members.password
    this.token = members.token
    this.ratings= members.ratings
    this.walletBalanceUsd= members.walletBalanceUsd
    this.walletBalanceBtc= members.walletBalanceBtc
    this.noOfRatings = members.noOfRatings
    this.noOfTransactions= members.noOfTransactions
    this.totalRatings = members.totalRatings
    this.twoFactor= members.twoFactor
    this.escrowWalletUsd= members.escrowWalletUsd

    // this.id=members.id
    // this.gender=members.gender
    // this.department=members.department
    // this.address=members.address
    // this.bankname=members.bankName
    
}
// find memebers by username or email
Members.findByUsername= async function(username, email){
    try{
        const result = await sql.query('SELECT * from profile where username =? OR email=?', [username, email])
        const data=result[0]
        console.log(data)
        console.log('-------------------------------------------------------CHECKING IF USERNAME EXISTS---------------')
        return data
    }catch(err){
        console.log(err)
        console.log('--------------------------------------------err--------------------------------------------------------')
        return (err)
    }
}

// find memebers by username or email
Members.findUsername= async function(username){
    try{
        const result = await sql.query('SELECT * from profile where username =? ', [username])
        const data=result[0]
        console.log(data)
        console.log('-------------------------------------------------------CHECKING IF USERNAME EXISTS---------------')
        return data
    }catch(err){
        console.log(err)
        console.log('--------------------------------------------err--------------------------------------------------------')
        return (err)
    }
}

// find level details
Members.findLevelDetails= async function(level){
    try{
        const result = await sql.query('SELECT * from level where level =? ', [level])
        const data=result[0]
        console.log(data)
        console.log('-------------------------------------------------------CHECKING IF level EXISTS---------------')
        return data
    }catch(err){
        console.log(err)
        console.log('--------------------------------------------err--------------------------------------------------------')
        return (err)
    }
}
// count members
Members.countMembers = async function(){
    try{
        const GroupCount= await sql.query('SELECT COUNT(id) AS NumberOfMembers FROM profile')
        data = GroupCount[0]
        return data
    }catch(err){
        console.log(err)
        return(err)
    }
    }
    // create new members
    // create members
Members.create = async function(newMember){
    const connection = await sql.getConnection();
     await connection.beginTransaction();
    try
    {
        console.log(newMember)
         const result = await connection.query('INSERT into profile SET username=?, level=?, code=?, ratings=?, isVerified=?, walletBalanceUsd=?, walletBalanceBtc=?, noOfRatings=?, email=?, noOfTransactions=?, totalRatings=?, twoFactor=?, escrowWalletUsd=?', [newMember.username, newMember.level, newMember.code, newMember.ratings, newMember.isVerified, newMember.walletBalanceUsd, newMember.walletBalanceBtc, newMember.noOfRatings, newMember.email, newMember.noOfTransactions, newMember.totalRatings, newMember.twoFactor, newMember.escrowWalletUsd])
         if (result[0].insertId){
             await connection.query('INSERT INTO member_authentication_table SET email=?, password=?', [newMember.email, newMember.password])
             console.log('---------------------------------Credentials filled------------------------------------------------------------------------------------------------------')
             // create requests
           
             await connection.commit();
             return result[0]
         }      
    }catch(err){
         await connection.rollback();
         console.log(err)
         return err
    }finally{
        connection.release();
    }
 }
 // Get token
 Members.getToken= async function(username,code){
    try{
      
        const result = await sql.query('SELECT * FROM  profile where username=? AND code=? ', [ username, code])
        console.log(result[0])
        const data= result[0]
        return data
    
      
        
    }catch(err){
        console.log(err)
        return (err)
    }
  }


    // vERIFY EMAIL
    Members.verifyEmail= async function(username, code, isVerified){
    try{
      
        const result = await sql.query('update profile set isVerified=? where code=? AND username=?',[isVerified ,code,username])
        const data=result[0]
       
        return data
    
      
        
    }catch(err){
        console.log(err)
        return (err)
    }
  }

  // find credential by email
Members.findByEmail= async function(email){
    try{
        const result = await sql.query('SELECT * FROM member_authentication_table WHERE email = ?', [email])
     //   console.log(result[0])
            const data=result[0]
            console.log('-------------------------------------------------------CHECKING IF USERNAME EXISTS auth table---------------')
            return data
        
    }catch(err){
        console.log(err)
        console.log('--------------------------------------------err--------------------------------------------------------')
        return (err)
    }
}

  // find credential by id
  Members.findDetailsById= async function(userId){
    try{
        const result = await sql.query('SELECT * from profile where id= ?', [userId])
     //   console.log(result[0])
            const data=result[0]
            console.log('-------------------------------------------------------CHECKING IF USERNAME EXISTS auth table---------------')
            return data
        
    }catch(err){
        console.log(err)
        console.log('--------------------------------------------err--------------------------------------------------------')
        return (err)
    }
}


// Get full members details by email
Members.findDetailsByEmail= async function(email){
    try{
        const result = await sql.query('SELECT * from profile where email =?', [email])
        const data=result[0]
      //  console.log(data)
        console.log('-------------------------------------------------------CHECKING IF USERNAME EXISTS details---------------')
        return data
    }catch(err){
        console.log(err)
        console.log('--------------------------------------------err--------------------------------------------------------')
        return (err)
    }
}

//set new password
Members.updatePassword= async function(email, password){
    try{
        const result = await sql.query('update member_authentication_table set password=? where email=?',[password,email])
        const data=result[0]
        console.log('-------------------------------------------------------CHECKING IF USERNAME EXISTS---------------')
        return data
    }catch(err){
        console.log(err)
        console.log('--------------------------------------------err--------------------------------------------------------')
        return (err)
    }
}
//set new password
Members.updateLevel= async function(id, newLevel){
    try{
        const result = await sql.query('update profile set level=? where id=?',[newLevel, id])
        const data=result[0]
        console.log('-------------------------------------------------------CHECKING IF USERNAME EXISTS---------------')
        return data
    }catch(err){
        console.log(err)
        console.log('--------------------------------------------err--------------------------------------------------------')
        return (err)
    }
}
// update two factor
Members.triggerTwoFactor= async function(type, id){

    if(type === "true"){
      twoFa = true
    }else{
      twoFa = false
    }
    try{
        const result = await sql.query('update profile set twoFactor=? where id=?',[twoFa, id])
        const data=result[0]
        console.log('-------------------------------------------------------CHECKING IF USERNAME EXISTS---------------')
        return data
    }catch(err){
        console.log(err)
        console.log('--------------------------------------------err--------------------------------------------------------')
        return (err)
    }
}

// rate a member
Members.Rate= async function(ratings, noOfRatings, totalRatings, receiverId){
    try{
        const result = await sql.query('update profile set ratings=?, noOfRatings=?, totalRatings=? where id=?',[ratings, noOfRatings,totalRatings, receiverId])
        const data=result[0]
        console.log('-------------------------------------------------------CHECKING IF USERNAME EXISTS---------------')
        return data
    }catch(err){
        console.log(err)
        console.log('--------------------------------------------err--------------------------------------------------------')
        return (err)
    }
}

//update wallet
Members.updateWallet= async function(finalBalanceBtc, finalBalanceUsd, noOfTransactions, shopperId){
    try{
        const result = await sql.query('update profile SET walletBalanceBtc=?, walletBalanceUsd=?, noOfTransactions=? where id =?',[finalBalanceBtc, finalBalanceUsd, noOfTransactions,  shopperId])
        const data=result[0]
        console.log('-------------------------------------------------------CHECKING IF USERNAME EXISTS---------------')
        return data
    }catch(err){
        console.log(err)
        console.log('--------------------------------------------err--------------------------------------------------------')
        return (err)
    }
}

//update wallet with escrow
Members.updateWalletEscrow= async function(finalBalanceBtc, finalBalanceUsd, noOfTransactions, shopperId, finalEscrowWalletUsd){
    try{
        const result = await sql.query('update profile SET walletBalanceBtc=?, walletBalanceUsd=?, noOfTransactions=?, escrowWalletUsd=? where id =?',[finalBalanceBtc, finalBalanceUsd, noOfTransactions, finalEscrowWalletUsd, shopperId])
        const data=result[0]
        console.log('-------------------------------------------------------CHECKING IF USERNAME EXISTS---------------')
        return data
    }catch(err){
        console.log(err)
        console.log('--------------------------------------------err--------------------------------------------------------')
        return (err)
    }
}


// update shopper escrow

Members.updateShopperEscrow= async function(finalEscrowWalletUsd, userId){
    try{
        const result = await sql.query('update profile SET  escrowWalletUsd=? where id =?',[finalEscrowWalletUsd, userId])
        const data=result[0]
        console.log('-------------------------------------------------------CHECKING IF USERNAME EXISTS---------------')
        return data
    }catch(err){
        console.log(err)
        console.log('--------------------------------------------err--------------------------------------------------------')
        return (err)
    }
}

// update two factor code

Members.updateTwoFactor= async function( userId, code){
    try{
        const result = await sql.query('update profile SET twoFactorCode=? where id =?',[ code, userId])
        const data=result[0]
        console.log('-------------------------------------------------------CHECKING IF USERNAME EXISTS---------------')
        return data
    }catch(err){
        console.log(err)
        console.log('--------------------------------------------err--------------------------------------------------------')
        return (err)
    }
}

//set new password
Members.updateEmail= async function(oldEmail, newEmail){
        const connection = await sql.getConnection();
        await connection.beginTransaction();
       try
       {    
        
            const result = await connection.query('update member_authentication_table set email=? where email=?',[newEmail, oldEmail])
       
            const result1 = await connection.query('update profile set email=? where email=?',[newEmail, oldEmail])
               await connection.commit();
               return result[0]
     
            
                                                                                                      
                 
       }catch(err){
            await connection.rollback();
            console.log(err)
            return err
       }finally{
           connection.release(); 
}
}


//save forgot password code
Members.saveForgetPasswordCode= async function(email, code){
    try{
        const result = await sql.query('update profile set forgotPasswordCode=? where email=?',[code,email])
        const data=result[0]
        console.log('-------------------------------------------------------CHECKING IF USERNAME EXISTS---------------')
        return data
    }catch(err){
        console.log(err)
        console.log('--------------------------------------------err--------------------------------------------------------')
        return (err)
    }
}

// get forgot password code
// Get full members details by email
Members.findForgotPasswordCode= async function(code, email){
    try{
        const result = await sql.query('SELECT * from profile where forgotPasswordCode =? AND email=?', [code, email])
        const data=result[0]
      //  console.log(data)
        console.log('-------------------------------------------------------CHECKING IF USERNAME EXISTS details---------------')
        return data
    }catch(err){
        console.log(err)
        console.log('--------------------------------------------err--------------------------------------------------------')
        return (err)
    }
}


Members.checkCode= async function(userId, code){
    try{
        const result = await sql.query('SELECT * from profile where twoFactorCode =? AND id=?', [code, userId])
        const data=result[0]
      //  console.log(data)
        console.log('-------------------------------------------------------CHECKING IF USERNAME EXISTS details---------------')
        return data
    }catch(err){
        console.log(err)
        console.log('--------------------------------------------err--------------------------------------------------------')
        return (err)
    }
}

//clear forgot password code

Members.clearForgotPasswordCode= async function( code, email){
    try{
        const code1= "";
        const result = await sql.query('update profile set forgotPasswordCode=? where email=? AND code=?',[code1,email, code])
        const data=result[0]
        console.log('-------------------------------------------------------CHECKING IF USERNAME EXISTS---------------')
        return data
    }catch(err){
        console.log(err)
        console.log('--------------------------------------------err--------------------------------------------------------')
        return (err)
    }
}
module.exports = Members