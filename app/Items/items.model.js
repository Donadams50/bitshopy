const sql=require("../Database/db");
const cron = require('node-cron');
const sendemail = require('../Helpers/emailhelper.js');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const btcconversion = require('../Helpers/btcconversion')
const { getConversionInBtc } = btcconversion;
const { getConversionInUsd } = btcconversion;

function delay() {
  return new Promise(resolve => setTimeout(resolve, 300));
}

const Items = function(){
    
}
 // process email
 async function processEmail(emailFrom, emailTo, subject, text, shopperUsername, earnerUsername, cancellationReason ){
  try{
    
     const sendmail =  await sendemail.notifyuser(emailFrom, emailTo, subject, text, shopperUsername, earnerUsername, cancellationReason);
   //  console.log(sendmail)
      return sendmail
  }catch(err){
      console.log(err)
      return err
  }

}


    // create wishlist
    Items.createOffer = async function(wishlistId, noOfItems, shopperId, discount, originalTotalPrice, totalPay, bitshopyFee, savedFee, taxPaid, onlyPrime, shippingFee, taxFee, Url, wishlistUrl){
        const connection = await sql.getConnection();
         await connection.beginTransaction();
        try
        {
            let status = "Pending"
           
             const result = await connection.query('INSERT into wishlist SET  wishlistId=?, noOfItems=?,  shopperId=?, discount=?, originalTotalPrice=?, totalPay=?, bitshopyFee=?, savedFee=?, status=?, taxPaid=?, onlyPrime=?, shippingFee=?, taxFee=?, purchaseUrl=?, wishlistUrl=?', [wishlistId, noOfItems, shopperId, discount, originalTotalPrice, totalPay, bitshopyFee, savedFee,status, taxPaid, onlyPrime, shippingFee, taxFee, Url, wishlistUrl])
           
                                                                                                                           
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
           
             const result = await connection.query('INSERT into wishlistitems SET  wishlistTableId =?, wishlistId=?, itemName=?,  price=?, price2=?, rating=?, comment=?, imgUrl=?,  link=?, priority=? ', [ wishlistTableId, wishlistId , wishlistItems.itemName, wishlistItems.price, wishlistItems.price2, wishlistItems.rating, wishlistItems.comment, wishlistItems.imgUrl,  wishlistItems.link, wishlistItems.priority])
           
                                                                                                                           
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

     
    //send message   
    Items.sendMessage = async function(offerId, text, userId, status, userIdShopper){
      const connection = await sql.getConnection();
       await connection.beginTransaction();
      try
      {
          let isRead = false;
         
           const result = await connection.query('INSERT into messages SET wishlistTableId=?, text=?, messageFrom =?, isRead=?, status=?, messageTo=?', [ offerId, text, userId,isRead, status, userIdShopper])
           const result2= await connection.query('INSERT into messages SET wishlistTableId=?, text=?, messageFrom =?, isRead=?, status=?, messageTo=?', [ offerId, text, userId,isRead, status, userId])
         
                                                                                                                         
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

   //send message   
   Items.sendMessageChat = async function(offerId, text, senderId, status, receiverId){
    const connection = await sql.getConnection();
     await connection.beginTransaction();
    try
    {
        let isRead = false;
        let isReadSender = true;
       
         const result = await connection.query('INSERT into messages SET wishlistTableId=?, text=?, messageFrom =?, isRead=?, status=?, messageTo=?', [ offerId, text, senderId,isReadSender, status, senderId])
         const result2= await connection.query('INSERT into messages SET wishlistTableId=?, text=?, messageFrom =?, isRead=?, status=?, messageTo=?', [ offerId, text, senderId,isRead, status, receiverId])
       
                                                                                                                       
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

   
    // delete message
    Items.deleteMessage = async function(offerId){
      const connection = await sql.getConnection();
       await connection.beginTransaction();
      try
      {
         
         
        const result = await connection.query('Delete from messages  where wishlistTableId=?  ', [offerId])
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
        let status3 = "Completed"
    //    const result = await sql.query('SELECT * FROM wishlist where status=? ', [status])
        const result = await sql.query('SELECT w.* , p.username, p.level FROM wishlist w, profile p where ((w.shopperId = p.id AND w.shopperId=? AND w.status!=?) OR (w.shopperId = p.id AND w.status=? ) ) ', [shopperId,status3,  status])
        const data= result[0]
        return data
    }catch(err){
     //   console.log(err)
        return (err)
    }
  }
// get earner details

Items.getEarner= async function(offerId, earnerId){
  try{
   
  //    const result = await sql.query('SELECT * FROM wishlist where status=? ', [status])
      const result = await sql.query('SELECT w.* , p.username FROM wishlist w, profile p where w.earnerId = p.id  AND w.id=? AND w.earnerId=? ', [offerId, earnerId])
      const data= result[0]
      return data
  }catch(err){
    console.log(err)
      return (err)
  }
}
// get all offer qualified for by a user

  Items.getAllOfferQualifiedFor= async function(discount, orderSizeLimit, userId){
    try{ 
        let status = "Pending";
        let status2= "Accepted"
        let status3 = "Completed"
        

// const result = await sql.query('SELECT * , profile.username, profile.level FROM wishlist INNER JOIN profile ON wishlist.shopperId = profile.id where status=? AND discount>=? AND totalPay<=? AND shopperId!=?', [status, discount, orderSizeLimit,shopperId])
const result = await sql.query('SELECT w.* , p.username, p.level FROM wishlist w, profile p where ((w.shopperId = p.id AND w.shopperId=? AND w.status!=?) OR (w.earnerId = p.id  AND w.earnerId=? AND w.status=? ) OR ( w.shopperId = p.id AND w.discount>=? AND w.totalPay<=?  AND w.status=?)) ', [userId,status3, userId, status2, discount, orderSizeLimit,  status])
//const result = await sql.query('SELECT w.*, p.username, p.level FROM wishlist w, profile p where ((w.shopperId = p.id AND w.shopperId=?) OR ( w.earnerId = p.id AND w.earnerId=? AND w.status!=? AND w.status!=? ))  ', [userId, userId,  status, status2])      
//  const result = await sql.query('SELECT * FROM wishlist where status=? AND discount>=? AND totalPay<=?', [status, discount, orderSizeLimit])
  console.log(result[0])
        const data= result[0]
        return data
    }catch(err){
       console.log(err)
        return (err)
    }
  }


 // get all item in a offer
  Items.getAllItemsInOffer= async function(offerId, userId){
    try{  
     let    totalOffer ={}
     let isRead = false
        const result = await sql.query('SELECT * FROM wishlistitems where wishlistTableId=?', [offerId])
        // const result1 = await sql.query('SELECT w.* , p.username, p.level   FROM wishlist w, profile p where (w.shopperId = p.id AND w.id=? AND w.shopperId=? ) OR ( w.earnerId = p.id AND w.id=? AND w.earnerId=?) ', [offerId,userId, offerId, userId])
        const result1 = await sql.query('SELECT w.* , p.username, p.level   FROM wishlist w, profile p where (w.shopperId = p.id AND w.id=? AND w.shopperId=? ) OR ( w.earnerId = p.id AND w.id=? AND w.earnerId=?) OR ( w.shopperId= p.id AND w.id=? AND (w.shopperId!=? OR w.earnerId !=?)) ', [offerId,userId, offerId, userId, offerId, userId, userId])
        const result2 = await sql.query('select messages.* , profile.username FROM messages left join profile on messages.messageFrom = profile.id where messages.wishlistTableId=? AND messages.messageTo=?', [offerId,userId])
       
        const result4 = await sql.query('SELECT * FROM messages where isRead=? AND wishlistTableId=? AND messageTo=?', [isRead, offerId, userId])
        ///  const result = await sql.query('SELECT w.*, p.username, p.level   FROM wishlist w, profile p where  (w.shopperId = p.id OR w.earnerId = p.id ) AND (shopperId=? OR earnerId=?) AND status!=? '
       // console.log(result2[0])
        totalOffer.offerItems = result[0]
        totalOffer.offer = result1[0]
        totalOffer.messages = result2[0]
        totalOffer.messageCount = result4[0].length
        return totalOffer
    }catch(err){
        console.log(err)
        return (err)
    }
  }
// get no of offer by a user
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


  // get all unread
  Items.getUnread= async function(offerId, userId){
    try{  
      let isRead = false
        const result = await sql.query('SELECT * FROM messages where isRead=? AND wishlistTableId=? AND messageTo=?', [isRead, offerId, userId])
        const data= result[0]
        return data
    }catch(err){
     //   console.log(err)
        return (err)
    }
  } 
  
  // get all messages
  Items.getAllMessages= async function(userId){
    try{  
      let isRead= false
        const result = await sql.query('SELECT * FROM messages where messageTo=? AND isRead=?', [userId, isRead])
        const data= result[0]
        return data
    }catch(err){
     //   console.log(err)
        return (err)
    }
  } 

  // mark as read
  Items.markRead= async function(wishlistTableId, userId){
    try{  
      let isRead = true
        const result = await sql.query('update messages SET isRead=? where wishlistTableId=? AND messageTo=?', [isRead, wishlistTableId,userId])
        const data= result[0]
        return data
    }catch(err){
     //   console.log(err)
        return (err)
    }
  } 

  // earner has pending offer ?
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

  // shopper has pending offer??
  Items.shopperHasPendingOffer= async function(userid){
    try{  
        let status = "Pending"
        const result = await sql.query('SELECT * FROM wishlist where status=? AND shopperId=?', [status, userid])
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
 Items.acceptOfferTemp = async function(  wishlistTableId , status, earnerId, exactAcceptTime){
    const connection = await sql.getConnection();
     await connection.beginTransaction();
    try
    {    
     
         const result = await connection.query('update wishlist SET status=?, earnerId=?, exactAcceptTime=? where id=?  ', [ status , earnerId, exactAcceptTime,  wishlistTableId])
    
          
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
 Items.getOrder= async function(userId, type){
    try{

      if (type === "Active"){
        let status = "Completed"
        let status2 = "Accepted"
        let status3 = "Pending"
        const result = await sql.query('SELECT w.*, p.username, p.level FROM wishlist w, profile p where (w.shopperId = p.id AND w.shopperId=? AND status=?) OR (w.earnerId = p.id AND w.shopperId=? AND status!=?) OR ( w.earnerId = p.id AND w.earnerId=? AND w.status!=? AND w.status!=? )  ', [userId, status3,userId, status, userId,  status, status2])
       // 'SELECT w.* , p.username, p.level FROM wishlist w, profile p where w.shopperId = p.id AND w.status=? AND w.discount>=? AND w.totalPay<=? 
        const data= result[0]
        console.log(data)
        console.log("ys")
        return data
      }else if (type === "Previous"){
        let status = "Completed"
        const result = await sql.query('SELECT w.*, p.username, p.level FROM wishlist w, profile p where (w.shopperId = p.id AND w.shopperId=? AND w.status=?) OR ( w.earnerId = p.id AND w.earnerId=? AND w.status=?) ', [userId, status, userId, status])
      
        const data= result[0]
        return data
      }
    }catch(err){
     //   console.log(err)
        return (err)
    }
  }

  
       // check if wish list exist
  Items.findPendingWishlistById= async function(id){
        try{
            let status ="Pending"
            const result = await sql.query('SELECT * FROM wishlist where id=? AND status=?', [id , status])
            const data= result[0]
            return data
        }catch(err){
         //   console.log(err)
            return (err)
        }
      }

         // check if wish list exist
  Items.findWishlistById= async function(id){
    try{
      
        const result = await sql.query('SELECT * FROM wishlist where id=?', [id])
        const data= result[0]
        return data
    }catch(err){
       console.log(err)
        return (err)
    }
  }
         // check if wish list exist
  Items.findAcceptedWishlistById= async function(id){
    try{
        let status ="Pending"
        let status1 = "Completed"
        const result = await sql.query('SELECT * FROM wishlist where id=? AND status!=? AND status!=?', [id , status, status1])
        const data= result[0]
        return data
    }catch(err){
     //   console.log(err)
        return (err)
    }
  }

// delete offer
Items.deleteOffer= async function(id){
  const connection = await sql.getConnection();
     await connection.beginTransaction();
    try
    {    
     let  data= {}
     
         const result = await connection.query('Delete from wishlist  where id=?  ', [id])
         const result1 = await connection.query('Delete from wishlistitems  where wishlistTableId=?  ', [id])
         const result2 = await connection.query('Delete from transactions  where wishlistTableId=?  ', [id])
          
            await connection.commit();
            data.result3 = result[0]
            data.result4 = result1[0]
            data.result5 = result2[0]
            return data

         
                                                                                                   
              
    }catch(err){
         await connection.rollback();
         console.log(err)
         return err
    }finally{
        connection.release();
    }
}


// shopper confirm delivery
Items.confirmDelivery = async function(id){
  const connection = await sql.getConnection();
   await connection.beginTransaction();
  try
  {    
    let status = "Completed"
   
       const result = await connection.query('update wishlist SET status=? where id=?  ', [ status ,  id])
  
        
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


// earner cancel offer
Items.earnerCancelOffer = async function(status, earnerId, amazonOrderId,  bitshopyOrderId, deliveryDate, orderLink, orderDate, offerId, reason, realEarnerId){
  const connection = await sql.getConnection();
   await connection.beginTransaction();
  try
  {    
   
       const result = await connection.query('update wishlist SET status=?, earnerId=?, amazonOrder=?, bitshopyOrder=?, deliveryDate=?, orderLink=?, orderDate=?  where id=?  ', [status, earnerId, amazonOrderId,  bitshopyOrderId, deliveryDate, orderLink, orderDate, offerId])
  
       const result1 = await connection.query('Delete from ordertable  where wishlistTableId=?  ', [offerId])
       const result2 =  await connection.query('INSERT INTO earnercancelreason SET  reason=?, wishlistTableId=?, earnerId=?', [ reason, offerId, realEarnerId])
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
 Items.getImageUrl= async function(wishlistTableId){
  try{
      const result = await sql.query('SELECT imgUrl FROM wishlistitems where wishlistTableId=? ', [wishlistTableId])
      const data= result[0]
      return data
  
  }catch(err){
   //   console.log(err)
      return (err)
  }
}


  

//Cron Jobs runs Here
var payment1 = cron.schedule('*\10 * * * *', async function() {
  console.log("30 mins");
  payment1.stop();
   const connection = await sql.getConnection()
   await connection.beginTransaction()
   try{
     let status = "Waiting for confirmation"
     let status1 = "Accepted"
       const unprocessOrder = await connection.query('select * from wishlist where status =? OR status=?', [status, status1])
  //    console.log(unprocessOrder[0])
      console.log("ff")
       init = await processArray(unprocessOrder[0]);
       console.log(init)
       if(init === "done"){
         payment1.start();
         console.log("i am re-starting")
        }else{
         console.log("error from return statement")
        }

      await connection.commit();
   }catch(err){
     //  console.log(err)
       await connection.rollback();
   }finally{
       connection.release() 
   }
// console.log('You will see this message every 15 minutes');

})
// Auto start your payment
payment1.start();


async function processArray(array) {
  console.log("gg")
  for (const item of array) {

    await delayedLog(item);
   // console.log(item)
  }
 return "done";
}

 //
 async function delayedLog(item) { 
  await delay();
//console.log(item)
  console.log("waiting and accepted");
    try{
      if(item.status === "Accepted"){
        console.log("i enter accepted")
        exactAcceptTime = item.exactAcceptTime;
      //  console.log(orderDate)
    var today = new Date();
    var Difference_In_Time = today.getTime() - exactAcceptTime.getTime();
  console.log(Difference_In_Time)
     diffInMinutes = millisToMinutesAndSeconds(Difference_In_Time)
     console.log(diffInMinutes)
  if (diffInMinutes > 33){
                status = "Pending"
                exactAcceptTime= ""
                earnerId = ""
                const connection = await sql.getConnection()
                await connection.beginTransaction()
                try{ 
               
                  const result = await connection.query('update wishlist SET status=?, earnerId=?, exactAcceptTime=? where id=?  ', [ status , earnerId, exactAcceptTime,  item.id])
                   console.log(result)
        
               
     
              
                  console.log("status changed succesful")
                 // console.log(pay.data.transactionId)
                  await connection.commit();
                  
                }catch(err){
                 console.log(err)
                 console.log("wait")
                  await connection.rollback();
                }finally{
                  connection.release()
                }
                
                
       
             //res.status(200).send(wid)
            }
      }

      else{
      orderDate = item.orderDate;
      console.log(orderDate)
  var today = new Date();
  var Difference_In_Time = today.getTime() - orderDate.getTime();
console.log(Difference_In_Time)
   diffInMinutes = millisToMinutesAndSeconds(Difference_In_Time)
   console.log(diffInMinutes)
if (diffInMinutes >= 30){
     let link = item.orderLink;
     console.log(link)
     getStatus= await axios.get( ''+link+'' ) 
console.log( "yes")
          //    let re6 = /(Ordered\s\<\w+\s\w+\=\"\w+\"\>\w+\,\s\w+\s\d+)/g;     
              let re6 =   /(Ordered\s\<\w+\s\w+\=\"\w+\"\>\w+\,\s\w+\s\d+)/g; 
              let found6 =  getStatus.data.match(re6);
              if(found6 === null){
                status = "Cancelled"
                const connection = await sql.getConnection()
              await connection.beginTransaction()
              try{ 
                let exactCancellationTime =  new Date();
             
                const result = await connection.query('UPDATE wishlist SET status=?, exactCancellationTime=? where id =?', [  status, exactCancellationTime,  item.id])
                 console.log(result)
                 let  text = "The system detect this order has been CANCELLED , please, the earner should cancel it, and update the order details with another valid order details or this order will be CANCELLED automatically after 12 hours"
                 let isRead = false;
              const result1 = await connection.query('INSERT into messages SET wishlistTableId=?, text=?, status =?, isRead=?, messageTo=?', [ item.id, text, status, isRead, item.shopperId])
              const result2 = await connection.query('INSERT into messages SET wishlistTableId=?, text=?, status =?, isRead=?, messageTo=?', [ item.id, text, status, isRead, item.earnerId])
       
                console.log("status changed succesful to cancelled")
               // console.log(pay.data.transactionId)
                await connection.commit();
                
              }catch(err){
               console.log(err)
               console.log("wait")
                await connection.rollback();
              }finally{
                connection.release()
              }
              }else{
              console.log(found6);
              wid = found6[0]
              statusf = "Not shipped yet"
              const connection = await sql.getConnection()
              await connection.beginTransaction()
              try{ 
             
                const result = await connection.query('UPDATE wishlist SET status=? where id =?', [  statusf, item.id])
                // console.log(result)
                 let  text = "Order confirmed, but not shipped yet"
                 let isRead = false;
              const result1 = await connection.query('INSERT into messages SET wishlistTableId=?, text=?, status =?, isRead=?, messageTo=?', [ item.id, text, status, isRead, item.shopperId])
              const result2 = await connection.query('INSERT into messages SET wishlistTableId=?, text=?, status =?, isRead=?, messageTo=?', [ item.id, text, status, isRead, item.earnerId])
   
            
                console.log("status changed succesful")
               // console.log(pay.data.transactionId)
                await connection.commit();
                
              }catch(err){
               console.log(err)
               console.log("wait")
                await connection.rollback();
              }finally{
                connection.release()
              }
              }
              
     
           //res.status(200).send(wid)
          }
  
        }



      }
      
      
      catch(err){
        console.log(err)
      
      }

    

}

// function to convert milli seconds to minutes
function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  
  return minutes
}


// second cron
var validatePayment = cron.schedule('30 20 * * *', async function() {
    console.log("i ran 3");
    const connection = await sql.getConnection()
    await connection.beginTransaction()
    try{
      let status = "Not shipped yet"
      let status1 = "Shipped"
      let status2 = "Cancelled"
      let status3= "Delivered"
      

        const processOrder = await connection.query('select * from wishlist where status=? OR status =? OR status=? OR status=? ', [status, status1, status2, status3])
     console.log(processOrder[0].length)
        processArrayFinalPayment(processOrder[0])
       await connection.commit();
    }catch(err){
       // console.log(err) 
        await connection.rollback();
    }finally{
        connection.release() 
    }
 // console.log('You will see this message every 15 minutes');

})
validatePayment.start();
 
 //  loop handler
 async function processArrayFinalPayment(array) {
   //console.log(array)
  for (const item of array) {
    await delayedLogFinalPayment(item);
  }
//  console.log('Done!');
}

async function delayedLogFinalPayment(item) {
  await delay();

  try{
  //  const status = item.status
   var  today = new Date();
  
     if(item.status === "Delivered"){
   const Differenc2= today.getTime() -  new Date(item.exactDeliveryTime).getTime();
   console.log(Differenc2)
   diffInHours2 = msToHours(Differenc2)
   console.log(diffInHours2)
   if (diffInHours2 >= 24 && item.status === "Delivered"){
    console.log("cc")
    const userDetails2 = await sql.query('SELECT * from profile where id= ?', [item.earnerId])
    console.log(userDetails2[0][0])
    const totalPay = item.totalPay;
    const initailBalanceBtc = userDetails2[0][0].walletBalanceBtc
    //const initailBalanceUsd = await getConversionInUsd(initailBalanceBtc) 
    const noOfTransactions = parseInt(userDetails2[0][0].noOfTransactions) + 1
    let type = "Earned"
    let status = "Success"
    statusUp = "Completed"
    let transactionDate = new Date()
    // console.log(userDetails2[0][0].walletBalanceBtc)
    // console.log(totalPay)
   // console.log(userDetails2[0][0].noOfTransactions)
    const totalPayBtc = await getConversionInBtc(totalPay)
   // console.log(totalPayBtc) 
    
  let finalBalanceBtc = parseFloat(initailBalanceBtc) + parseFloat(totalPayBtc)
  const finalBalanceUsd = await getConversionInUsd(finalBalanceBtc) 
  const connection = await sql.getConnection();
    await connection.beginTransaction();
   try
   {    
    
        const result = await connection.query('update profile SET walletBalanceBtc=?, walletBalanceUsd=?, noOfTransactions=? where id =?',[finalBalanceBtc, finalBalanceUsd, noOfTransactions, item.earnerId])
   
        const result1 = await connection.query('INSERT into transactions SET  amountUsd=?,  type=?, status=?, transactionDate=?, userId=?, wishlistTableId=?, amountBtc=?, initialBalance=?,finalBalance=? ', [totalPay, type, status, transactionDate, item.earnerId , item.id, totalPayBtc, initailBalanceBtc, finalBalanceBtc])
       
        const result2 = await connection.query('update wishlist SET status=? where id=?  ', [ statusUp ,  item.id])
        let  text = "Order has, been completed automatically and the escrow has been released to the earner"
        let isRead = false;
     const result3 = await connection.query('INSERT into messages SET wishlistTableId=?, text=?, status =?, isRead=?, messageTo=?', [ item.id, text, statusUp, isRead, item.shopperId])
     const result4 = await connection.query('INSERT into messages SET wishlistTableId=?, text=?, status =?, isRead=?, messageTo=?', [ item.id, text, statusUp, isRead, item.earnerId])
  
        
        await connection.commit();
                                                                                              
             console.log("kk")
   }catch(err){
        await connection.rollback();
        console.log(err)
        return err
   }finally{
       connection.release();
   }
  
  
  
  }
  }
  else if(item.status === "Cancelled"){
  
const Difference_Time = today.getTime() - new Date(item.exactCancellationTime).getTime();
console.log(Difference_Time)
diffInHours = msToHours(Difference_Time)
console.log(diffInHours)
if (diffInHours >= 12 && item.status === "Cancelled"){
  const emailFrom = 'Bitshopy   <noreply@bitshopy.com>';
    const subject = 'Offer Cancelled';                      
    const earn = await sql.query('SELECT w.* , p.username, p.email FROM wishlist w, profile p where w.earnerId = p.id  AND w.id=? AND w.earnerId=? ', [item.id, item.earnerId])
    const shop = await sql.query('SELECT * from profile where id= ?', [item.shopperId])
    console.log(earn[0][0])
    console.log(shop[0][0].email)
    const shopperUsername = shop[0][0].username
    const earnerUsername = earn[0][0].username
    console.log(shopperUsername)
    console.log(earnerUsername)
    const emailTo = shop[0][0].email.toLowerCase();
    const cancellationReason = "The system detected that amazon cancelled the order"
    const text = "boring-snyder-80af72.netlify.app/#/earncrypto" 
   processEmail(emailFrom, emailTo, subject, text, shopperUsername, earnerUsername, cancellationReason);
   processEmail(emailFrom, earn[0][0].email, subject, text, shopperUsername, earnerUsername, cancellationReason);
  let status ="Pending"
  console.log("bb")
  let earnerId= ""
  let amazonOrderId = " "
  let bitshopyOrderId = " "
  let deliveryDate = " "
  let orderLink = " "
  let orderDate = " "
  let reason = " Amazon cancelled the offer"
  const connection = await sql.getConnection();
  await connection.beginTransaction();
 try
 {    
  
      const result = await connection.query('update wishlist SET status=?, earnerId=?, amazonOrder=?, bitshopyOrder=?, deliveryDate=?, orderLink=?, orderDate=?  where id=?  ', [status, earnerId, amazonOrderId,  bitshopyOrderId, deliveryDate, orderLink, orderDate, item.id])
 
      const result1 = await connection.query('Delete from ordertable  where wishlistTableId=?  ', [item.id])
      const result2 =  await connection.query('INSERT INTO earnercancelreason SET  reason=?, wishlistTableId=?, earnerId=?', [ reason, item.id, item.earnerId])
      const result3 = await connection.query('Delete from messages  where wishlistTableId=?  ', [item.id])   
      await connection.commit();
                                                                                                
           
                                          }catch(err){
                                                await connection.rollback();
                                                console.log(err)
                                                return err
                                          }finally{
                                              connection.release();
                                          }



                      }

          }
 

   else{

  let link = item.orderLink;
  getStatus= await axios.get( ''+link+'' ) 
  let re = /(Delivered\s\<\w+\s\w+\=\"\w+\"\>\w+\s\d+)/g;

  let found = getStatus.data.match(re);
          if(found === null){
              let re5= /(Shipped\s\<\w+\s\w+\=\"\w+\"\>\w+\,\s\w+\s\d+)/g;     
              
          let found5 =  getStatus.data.match(re5);
         
          if(found5 === null){
              let re6 = /(Ordered\s\<\w+\s\w+\=\"\w+\"\>\w+\,\s\w+\s\d+)/g;     
              
          let found6 =  getStatus.data.match(re6);
          if(found6 === null){
            status = "Cancelled"
            const connection = await sql.getConnection()
          await connection.beginTransaction()
          try{ 
            if(item.status === "Cancelled"){
              console.log("Already cancelled")
            }else{          
            let exactCancellationTime =  new Date();
             
            const result = await connection.query('UPDATE wishlist SET status=?, exactCancellationTime=? where id =?', [  status, exactCancellationTime,  item.id])
           // const result = await connection.query('UPDATE wishlist SET status=? where id =?', [  status, item.id])
             console.log(result)
             let  text = "The system detect this order has been CANCELlED , please, the earner should cancel it, and update the order details with another valid order details or this order will be CANCELLED automatically after 12 hours."
             let isRead = false;
          const result1 = await connection.query('INSERT into messages SET wishlistTableId=?, text=?, status =?, isRead=?, messageTo=?', [ item.id, text, status, isRead, item.shopperId ])
          const result2 = await connection.query('INSERT into messages SET wishlistTableId=?, text=?, status =?, isRead=?, messageTo=?', [ item.id, text, status, isRead, item.earnerId ])
        }  
          console.log("status has been cancelled")
           // console.log(pay.data.transactionId)
            await connection.commit();
            //return data
          }catch(err){
           console.log(err)
           console.log("wait")
            await connection.rollback();
          }finally{
            connection.release()
          }
          }else{
          console.log(found6);
          wid = found6[0]
          status = "Not shipped yet"
          const connection = await sql.getConnection()
          await connection.beginTransaction()
          try{ 
         
            const result = await connection.query('UPDATE wishlist SET status=? where id =?', [  status, item.id])
             console.log(result)
        
            console.log("status changed succesful to not shipped yet")
           // console.log(pay.data.transactionId)
            await connection.commit();
         //   return data
          }catch(err){
           console.log(err)
           console.log("wait")
            await connection.rollback();
          }finally{
            connection.release()
          }
          }
          } else{
              console.log(found5);
              wid = found5[0]
              console.log(wid)
              status = "Shipped"
              const connection = await sql.getConnection();
              await connection.beginTransaction();
             try
             { if(item.status === "Shipped"){
              console.log("status is shipped already")
                }   
              else{
                  const result = await connection.query('update wishlist SET status=? where id=?  ', [status, item.id])
                  let  text = "The order has been shipped"
                  let isRead = false;
                 const result1 = await connection.query('INSERT into messages SET wishlistTableId=?, text=?, status =?, isRead=?, messageTo=?', [ item.id, text, status, isRead, item.shopperId])
                 const result2 = await connection.query('INSERT into messages SET wishlistTableId=?, text=?, status =?, isRead=?, messageTo=?', [ item.id, text, status, isRead, item.earnerId])
                }
                     await connection.commit();
                    // return result[0]                                                                                           
                       
             }catch(err){
                  await connection.rollback();
                  console.log(err)
                  return err
             }finally{
                 connection.release();
             }
          }
          
      } else{
          console.log(found);
          wid = found[0]
          console.log(wid)
        let  status = "Delivered"
        let exactDeliveryTime =  new Date();
          const connection = await sql.getConnection();
          await connection.beginTransaction();
         try
         {    
           if(item.status === "Delivered"){
         console.log("status is delivered already")
           }
          else{
              const result = await connection.query('update wishlist SET status=? , exactDeliveryTime=? where id=?  ', [status,exactDeliveryTime, item.id])
         
              let  text = "Order has been delivered, please comfirm delivery. The system will confirm it after 24 hours if the shopper has not done that."
              let isRead = false;
           const result1 = await connection.query('INSERT into messages SET wishlistTableId=?, text=?, status =?, isRead=?, messageTo=?', [ item.id, text, status, isRead, item.shopperId])
           const result2 = await connection.query('INSERT into messages SET wishlistTableId=?, text=?, status =?, isRead=?, messageTo=?', [ item.id, text, status, isRead, item.earnerId])
          }
                 await connection.commit();
                                                                                                        
                   
         }catch(err){
              await connection.rollback();
              console.log(err)
              return err
         }finally{
             connection.release();
         }
      }


       }

  
  }




  catch(err){
       console.log(err)
      return err
  }
     
  
  
}

// function to convert milliseconds to hours
function msToHours(duration) {
 let  hours = Math.floor((duration / (1000 * 60 * 60)) );

  return hours 
}

      
 


module.exports = Items