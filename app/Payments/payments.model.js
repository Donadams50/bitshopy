const sql=require("../Database/db");
const cron = require('node-cron');
const axios = require('axios');
const Members = require('../Members/members.model.js');
const dotenv = require('dotenv');
dotenv.config();

const Payments = function(){
    
}


//delay function

function delay() {
  return new Promise(resolve => setTimeout(resolve, 300));
}

// create transaction
Payments.createTransaction = async function(  type, status,transactionDate,  receiverAddress, noOfCheck, userId){
    const connection = await sql.getConnection();
     await connection.beginTransaction();
    try
    {
        let status = "Pending"
       
         const result = await connection.query('INSERT into transactions SET  type=?, status=?, transactionDate=?,  receiverAddress=?, noOfCheck=?, userId=?', [   type, status,transactionDate,  receiverAddress, noOfCheck, userId])
       
                                                                                                                       
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


 // create transation for importing wishlist
// Payments.createTransactionSpend = async function( totalPay, type, status, transactionDate, shopperId , wishlistTableId, amountBtc, initailBalanceBtc, finalBalanceBtc){
//   const connection = await sql.getConnection();
//    await connection.beginTransaction();
//   try
//   {
     
//        const result = await connection.query('INSERT into transactions SET  amountUsd=?  type=?, status=?, transactionDate=?, userId=?, wishlistTableId=?, amountBtc=?, initialBalance=?,finalBalance=? ', [totalPay, type, status, transactionDate, shopperId , wishlistTableId, amountBtc, initailBalanceBtc, finalBalanceBtc])
                                                                                                               
//            await connection.commit();
//            return result[0]
            
//   }catch(err){
//        await connection.rollback();
//        console.log(err)
//        return err
//   }finally{
//       connection.release();
//   }
// }


 // create transaction for withdrawer
 Payments.createTransactionSpend = async function( totalPay, type, status, transactionDate, shopperId , wishlistTableId, amountBtc, initailBalanceBtc, finalBalanceBtc){
  const connection = await sql.getConnection();
   await connection.beginTransaction();
  try
  {
     
       const result = await connection.query('INSERT into transactions SET  amountUsd=?,  type=?, status=?, transactionDate=?, userId=?, wishlistTableId=?, amountBtc=?, initialBalance=?, finalBalance=? ', [totalPay, type, status, transactionDate, shopperId , wishlistTableId, amountBtc, initailBalanceBtc, finalBalanceBtc])
                                                                                                               
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


// create transaction for withdrawer
Payments.createTransactionWithdrawer = async function(amountBtc, amountUsd, type, status,transactionDate, receiverAddress,userid, initailBalanceBtc, finalBalanceBtc){
  const connection = await sql.getConnection();
   await connection.beginTransaction();
  try
  {
     
       const result = await connection.query('INSERT into transactions SET  amountBtc=?, amountUsd=?,  type=?, status=?, transactionDate=?, receiverAddress=?, userId=?,  initialBalance=?,finalBalance=? ', [amountBtc, amountUsd, type, status,transactionDate, receiverAddress,userid, initailBalanceBtc, finalBalanceBtc])
                                                                                                               
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



// get all transactions
  Payments.getTransactionHistory= async function(userid){
    try{  
      let status = "Success"
      
        const result = await sql.query('SELECT * FROM transactions where userId=? AND status=?', [userid, status])
        const data= result[0]
        return data
    }catch(err){
        console.log(err)
        return (err)
    }
  }  




 // Cron Jobs runs Here
 var payment = cron.schedule('*\5 * * * *', async function() {
   console.log("i ran fund wallet");
   payment.stop();
    const connection = await sql.getConnection()
    await connection.beginTransaction()
    try{
      let status = "Pending"
      let noOfCheckLimit= 50;
        const unprocessOrder = await connection.query('select * from transactions where status=? AND noOfCheck <=?', [status, noOfCheckLimit])
        console.log(unprocessOrder[0])
        
        init = await processArray(unprocessOrder[0]);
        console.log(init)
        if(init === "done"){
          payment.start();
          console.log("i am re-starting")
         }else{
          console.log("error from return statement")
         }
 
       await connection.commit();
    }catch(err){
       console.log(err)
        await connection.rollback();
    }finally{
        connection.release() 
    }
 // console.log('You will see this message every 15 minutes');
 
 })
 // Auto start your payment
 payment.start();
 
 
 async function processArray(array) {
   for (const item of array) {
     await delayedLogoption2(item);
   }
  return "done";
 }
 
  //
  async function delayedLog(item) { 
   await delay();
    let type = "received"
     let addresses = item.receiverAddress;
     try{
  
        getTransaction = await axios.get( 'https://block.io/api/v2/get_transactions/?api_key='+process.env.api_key+'&type='+type+'&addresses='+address+'') 
        console.log(getTransaction.data)
        let noOfCheck = parseInt(item.noOfCheck) + 1;

        for( var i = 0; i < getTransaction.data.txn.length; i++){
          if( item.receiverAddress ===  getTransaction.data.txn[i].receiverAddress && item.senderAddress === getTransaction.data.txn[i].senderAddress && item.amountBtc === getTransaction.data.txn[i].amount )
          { 
            getUsdInBitcoin = await axios.get('https://blockchain.info/ticker')  
             console.log(getUsdInBitcoin.USD)
               let amountBtc = getTransaction.data.txn[i].amount
               let amountUsd = parseFloat(getUsdInBitcoin.USD.last) * parseFloat(amountBtc) 
               let status = "Success"
              const userDetails2 = await Members.findDetailsById(item.userId)
              if (userDetails2.length>0){
                  const noOfTransactions = parseInt(userDetails2[0].noOfTransactions) + 1
                   const initailBalanceBtc = userDetails2[0].walletBalanceBtc
                   const initailBalanceUsd = userDetails2[0].walletBalanceUsd
                    let finalBalanceBtc = parseFloat(initailBalanceBtc) + parseFloat(amountBtc)
                    let finalBalanceUsd = parseFloat(initailBalanceUsd) + parseFloat(amountUsd)
                    const connection = await sql.getConnection()
                    await connection.beginTransaction()
                    try{
                      data = {}
                   
                      const result = await connection.query('UPDATE transactions SET status=?, noOfCheck=?, initailBalance=?, finalBalance=?, amountBtc=?, amountUsd=? where id =?', [  status, noOfCheck, initailBalanceBtc, finalBalanceBtc, amountBtc,amountUsd ,item.id])
                      const result1 = await connection.query('UPDATE profile SET walletBalanceBtc=?, walletBalanceUsd=?, noOfTransactions=? where id =?', [finalBalanceBtc, finalBalanceUsd, noOfTransaction, item.userId])
          
                      data.result2 =  result[0];
                      data.result3= result1[0];
                      console.log("payment succesful")
                     // console.log(pay.data.transactionId)
                      await connection.commit();
                      return data
                    }catch(err){
                     //console.log(err)
                    //  console.log("wait")
                      await connection.rollback();
                    }finally{
                      connection.release()
                    }
                    
                  //   const updatetransaction = await Payments.updateTransaction(item.id, noOfCheck, status, initailBalanceBtc, finalBalanceBtc, amountBtc,amountUsd)
                  //  const updatewallet = await Members.updateWallet(item.userId, finalBalanceBtc, finalBalanceUsd, noOfTransaction)
                }else{
                  console.log("user not found")
                }
           
          }else{
              if(noOfCheck >= 50){
                  status = "failed"
              }else{
                status = "Pending"
              }
              const result = await connection.query('UPDATE transactions SET status=?, noOfCheck=? where id =?', [  status, noOfCheck ,item.id])

          }
        }


       }
       
       
       catch(err){
        
         await connection.rollback();
       }finally{
         connection.release()
       }
 
     
 
 }

 async function delayedLogoption2(item) { 
  await delay();
   let type = "received"
    let address = item.receiverAddress;
    try{
 
     // https://block.io/api/v2/get_address_balance/?api_key=31b1-c169-1f5e-cd73&addresses=2NDUtcGFgPJJX4Fz91uN3MnpfYyrLgcTtJy
       getBalance = await axios.get( 'https://block.io/api/v2/get_address_balance/?api_key='+process.env.api_key+'&addresses='+address+'') 
      
       
       if(getBalance.data.status === "success"){
       let noOfCheck = parseInt(item.noOfCheck) + 1;
         if( item.receiverAddress ===  getBalance.data.data.balances[0].address  && getBalance.data.data.balances[0].pending_received_balance > 0 )
         { 
           console.log("yess")
           getUsdInBitcoin = await axios.get('https://blockchain.info/ticker')  
            console.log(getUsdInBitcoin.data.USD.last)
              let amountBtc = parseFloat(getBalance.data.data.balances[0].pending_received_balance)
              let amountUsd = parseFloat(getUsdInBitcoin.data.USD.last) * parseFloat(amountBtc) 
              let status = "Success"
             const userDetails2 = await Members.findDetailsById(item.userId)
             if (userDetails2.length>0){
               
              console.log("user found")
                 const noOfTransactions = parseInt(userDetails2[0].noOfTransactions) + 1
                  const initailBalanceBtc = userDetails2[0].walletBalanceBtc
                  const initailBalanceUsd = userDetails2[0].walletBalanceUsd
                   let finalBalanceBtc = parseFloat(initailBalanceBtc) + parseFloat(amountBtc)
                   let finalBalanceUsd = parseFloat(getUsdInBitcoin.data.USD.last) * parseFloat(finalBalanceBtc) 
                   const connection = await sql.getConnection()
                   await connection.beginTransaction()
                   try{
                  
                     data = {}
                  
                     const result = await connection.query('UPDATE transactions SET status=?, noOfCheck=?, initialBalance=?, finalBalance=?, amountBtc=?, amountUsd=? where id =?', [  status, noOfCheck, initailBalanceBtc, finalBalanceBtc, amountBtc,amountUsd ,item.id])
                      console.log(result)
                     const result1 = await connection.query('UPDATE profile SET walletBalanceBtc=?, walletBalanceUsd=?, noOfTransactions=? where id =?', [finalBalanceBtc, finalBalanceUsd, noOfTransactions, item.userId])
                     console.log(result1)
                     data.result2 =  result[0];
                     data.result3= result1[0];
                     console.log("payment succesful")
                    // console.log(pay.data.transactionId)
                     await connection.commit();
                     return data
                   }catch(err){
                    console.log(err)
                    console.log("wait")
                     await connection.rollback();
                   }finally{
                     connection.release()
                   }
                   
                 //   const updatetransaction = await Payments.updateTransaction(item.id, noOfCheck, status, initailBalanceBtc, finalBalanceBtc, amountBtc,amountUsd)
                 //  const updatewallet = await Members.updateWallet(item.userId, finalBalanceBtc, finalBalanceUsd, noOfTransaction)
               }else{
                 console.log("user not found")
               }
          
         }else{
           console.log("no")
             if(noOfCheck >= 50){
                 status = "failed"
             }else{
               status = "Pending"
             }
             const result = await sql.query('UPDATE transactions SET status=?, noOfCheck=? where id =?', [  status, noOfCheck ,item.id])

         }
       
        }else{
          console.log("error while getting address balance")
        }

      }
      
      
      catch(err){
       
        console.log(err)
      }

    

}
 

 
module.exports = Payments