const sql=require("../Database/db");
const cron = require('node-cron');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const Items = function(){
    
}

    // create wishlist
    Items.createOffer = async function(wishlistId, noOfItems, shopperId, discount, originalTotalPrice, totalPay, bitshopyFee, savedFee, taxPaid, onlyPrime, shippingFee, taxFee, wishlistUrl){
        const connection = await sql.getConnection();
         await connection.beginTransaction();
        try
        {
            let status = "Pending"
           
             const result = await connection.query('INSERT into wishlist SET  wishlistId=?, noOfItems=?,  shopperId=?, discount=?, originalTotalPrice=?, totalPay=?, bitshopyFee=?, savedFee=?, status=?, taxPaid=?, onlyPrime=?, shippingFee=?, taxFee=?, wishlistUrl=?', [wishlistId, noOfItems, shopperId, discount, originalTotalPrice, totalPay, bitshopyFee, savedFee,status, taxPaid, onlyPrime, shippingFee, taxFee, wishlistUrl])
           
                                                                                                                           
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


       // check if wish list exist
       Items.findByWishlistId= async function(wishlistId , wishlistUrl){
        try{
            
            const result = await sql.query('SELECT * FROM wishlist where wishlistId=? AND wishlistUrl=?', [wishlistId , wishlistUrl])
            const data= result[0]
            return data
        }catch(err){
         //   console.log(err)
            return (err)
        }
      }
     // create wish list items
      
    Items.createItems = async function(wishlistItems, wishlistTableId, wishlistId){
        const connection = await sql.getConnection();
         await connection.beginTransaction();
        try
        {
            console.log(wishlistItems)
           
             const result = await connection.query('INSERT into wishlistitems SET  wishlistTableId =?, wishlistId=?, itemName=?,  price=?, price2=?, rating=?, comment=?, imgUrl=?, dateAdded=?, link=?, priority=? ', [ wishlistTableId, wishlistId , wishlistItems.itemName, wishlistItems.price, wishlistItems.price2, wishlistItems.rating, wishlistItems.comment, wishlistItems.imgUrl, wishlistItems.dateAdded, wishlistItems.link, wishlistItems.priority])
           
                                                                                                                           
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

     
    // get all offer for a user to earn
     Items.getAllOffer= async function(shopperId){
    try{
        let status = "Pending";
        const result = await sql.query('SELECT * FROM wishlist where status=?  AND shopperId!=?', [status, shopperId])
        const data= result[0]
        return data
    }catch(err){
     //   console.log(err)
        return (err)
    }
  }

// get all offer qualified for by a user

  Items.getAllOfferQualifiedFor= async function(discount, orderSizeLimit, shopperId){
    try{ 
        let status = "Pending";
        

// const result = await sql.query('SELECT * , profile.username, profile.level FROM wishlist INNER JOIN profile ON wishlist.shopperId = profile.id where status=? AND discount>=? AND totalPay<=? AND shopperId!=?', [status, discount, orderSizeLimit,shopperId])
const result = await sql.query('SELECT w.* , p.username, p.level FROM wishlist w, profile p where w.shopperId = p.id AND w.status=? AND w.discount>=? AND w.totalPay<=? AND w.shopperId!=?', [status, discount, orderSizeLimit,shopperId])
      //  const result = await sql.query('SELECT * FROM wishlist where status=? AND discount>=? AND totalPay<=?', [status, discount, orderSizeLimit])
  // console.log(result[0])
        const data= result[0]
        return data
    }catch(err){
       console.log(err)
        return (err)
    }
  }


 // get all item in a offer
  Items.getAllItemsInOffer= async function(offerId){
    try{  
     let    totalOffer ={}

        const result = await sql.query('SELECT * FROM wishlistitems where wishlistTableId=?', [offerId])
        const result1 = await sql.query('SELECT * FROM wishlist where id=?', [offerId])

        totalOffer.offerItems = result[0]
        totalOffer.offer = result1[0]
        return totalOffer
    }catch(err){
        console.log(err)
        return (err)
    }
  }

  Items.findNumberOfOffer= async function(userid){
    try{  
      
        const result = await sql.query('SELECT * FROM wishlist where shopperId=?', [userid])
        const data= result[0]
        return data
    }catch(err){
     //   console.log(err)
        return (err)
    }
  }  

  
  Items.UserHasPendingOffer= async function(userid){
    try{  
         let status = "Completed"
        let status2 = "Pending"
        const result = await sql.query('SELECT * FROM wishlist where (status!=? OR status!=?) AND earnerId=?', [status, status2 ,userid])
        const data= result[0]
        return data
    }catch(err){
     //   console.log(err)
        return (err)
    }
  }
  
  
  // accept offer after purchase has been done
  Items.acceptOffer = async function(amazonOrderId, shopperId, earnerId, wishlistTableId,  bitshopyOrderId,  status, deliveryDate, wishlistId, orderLink, orderDate){
    const connection = await sql.getConnection();
     await connection.beginTransaction();
    try
    {    
      let  statusWishlist = "Ordered"
         const result = await connection.query('update wishlist SET  earnerId=?, status=?, amazonOrder=?, bitshopyOrder=?, deliveryDate=?, orderLink=?, orderDate=? where id=?  ', [earnerId, status, amazonOrderId, bitshopyOrderId, deliveryDate,  orderLink, orderDate, wishlistTableId])
       console.log(result[0])
         if (result[0].affectedRows  === 1){  
            console.log('---------------------------------update wishlist succesful, now update order table------------------------------------------------------------------------------------------------------')
       const result1 =  await connection.query('INSERT INTO ordertable SET amazonOrderId=?, bitshopyOrderId=?, shopperId=?, earnerId=?, status=?,deliveryDate=?, wishlistId=? , wishlistTableId=?, orderLink=?, orderDate=?', [amazonOrderId, bitshopyOrderId, shopperId, earnerId, status, deliveryDate, wishlistId, wishlistTableId, orderLink, orderDate])
            console.log('---------------------------------update order table succesfull------------------------------------------------------------------------------------------------------')
            // create requests
          
            await connection.commit();
            return result1[0]

         }                                                                                          
              
    }catch(err){
         await connection.rollback();
         console.log(err)
         return err
    }finally{
        connection.release();
    }
 }

 // accept offer temporarily
 Items.acceptOfferTemp = async function(  wishlistTableId , status, earnerId){
    const connection = await sql.getConnection();
     await connection.beginTransaction();
    try
    {    
     
         const result = await connection.query('update wishlist SET status=?, earnerId=? where id=?  ', [ status , earnerId,  wishlistTableId])
    
          
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


 // get all offer
 Items.getOrder= async function(userId){
    try{
        let status = "Completed"
        const result = await sql.query('SELECT * FROM wishlist where (shopperId=? OR earnerId=?) AND status!=? ', [userId, userId, status])
        const data= result[0]
        return data
    }catch(err){
     //   console.log(err)
        return (err)
    }
  }

// Cron Jobs runs Here
// var payment = cron.schedule('*\10 * * * *', async function() {
//   //console.log("i ran");
//   payment.stop();
//    const connection = await sql.getConnection()
//    await connection.beginTransaction()
//    try{
//      let status = "Waiting for confimation"
//        const unprocessOrder = await connection.query('select * from wishlist where status =?', [status])
//       console.log(unprocessOrder[0])
       
//        init = await processArray(unprocessOrder[0]);
//        console.log(init)
//        if(init === "done"){
//          payment.start();
//          console.log("i am re-starting")
//         }else{
//          console.log("error from return statement")
//         }

//       await connection.commit();
//    }catch(err){
//      //  console.log(err)
//        await connection.rollback();
//    }finally{
//        connection.release() 
//    }
// // console.log('You will see this message every 15 minutes');

// })
// // Auto start your payment
// payment.start();


// async function processArray(array) {
//   for (const item of array) {
//     await delayedLog(item);
//   }
//  return "done";
// }

//  //
//  async function delayedLog(item) { 
//   await delay();
 
//    let paymentId = item.id
//    let status_initial = "attempted";
//    let status_final = "PENDING";
//    let cron_status_initial = "unattempted";
//    let cron_status_final = "attempted";
//    const headers = {
//     'Content-Type': 'application/json',
//     'Token':process.env.API_KEY
//   }





//     try{
 
   
//       }
      
      
//       catch(err){
       
//         await connection.rollback();
//       }finally{
//         connection.release()
//       }

    

// }

     
    

      
 


module.exports = Items