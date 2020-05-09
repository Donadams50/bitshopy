const sql=require("../Database/db");

const Items = function(){
    
}

    // create wishlist
    Items.createOffer = async function(wishlistId, noOfItems, shopperId, discount, originalTotalPrice, totalPay, bitshopyFee, savedFee, taxPaid, onlyPrime){
        const connection = await sql.getConnection();
         await connection.beginTransaction();
        try
        {
            let status = "Pending"
           
             const result = await connection.query('INSERT into wishlist SET  wishlistId=?, noOfItems=?,  shopperId=?, discount=?, originalTotalPrice=?, totalPay=?, bitshopyFee=?, savedFee=?, status=?, taxPaid=?, onlyPrime=?', [wishlistId, noOfItems, shopperId, discount, originalTotalPrice, totalPay, bitshopyFee, savedFee,status, taxPaid, onlyPrime])
           
                                                                                                                           
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

     // create wish list items
      
    Items.createItems = async function(wishlistItems, wishlistTableId, wishlistId){
        const connection = await sql.getConnection();
         await connection.beginTransaction();
        try
        {
            console.log(wishlistItems)
           
             const result = await connection.query('INSERT into wishlistitems SET  wishlistTableId =?, wishlistId=?, itemName=?,  newPrice=?, oldPrice=?, rating=?, comment=?, imgUrl=?, dateAdded=?, link=?, priority=? ', [ wishlistTableId, wishlistId , wishlistItems.itemName, wishlistItems.newPrice, wishlistItems.oldPrice, wishlistItems.rating, wishlistItems.comment, wishlistItems.imgUrl, wishlistItems.dateAdded, wishlistItems.link, wishlistItems.priority])
           
                                                                                                                           
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
    
     Items.getAllOffer= async function(status){
    try{
        let status = pending;
        const result = await pool.query('SELECT * FROM wishlist where status=?', [status])
        const data= result[0]
        return data
    }catch(err){
     //   console.log(err)
        return (err)
    }
  }



  Items.getAllOfferQualifiedFor= async function(discount, orderSizeLimit){
    try{ 
        let status = pending;
        const result = await pool.query('SELECT * FROM wishlist where status=? AND discount>=? AND totalPay<=?', [status, discount, orderSizeLimit])
        const data= result[0]
        return data
    }catch(err){
     //   console.log(err)
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

module.exports = Items