const sql=require("../Database/db");

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

     // get all offer
    // get all offer
     Items.getAllOffer= async function(status){
    try{
        let status = pending;
        const result = await sql.query('SELECT * FROM wishlist where status=?', [status])
        const data= result[0]
        return data
    }catch(err){
     //   console.log(err)
        return (err)
    }
  }

// get all offer qualified for by a user

  Items.getAllOfferQualifiedFor= async function(discount, orderSizeLimit){
    try{ 
        let status = "Pending";
        
// SELECT Orders.OrderID, Customers.CustomerName
// FROM Orders
// INNER JOIN Customers ON Orders.CustomerID = Customers.CustomerID;
const result = await sql.query('SELECT * FROM wishlist INNER JOIN profile ON wishlist.shopperId = profile.id where status=? AND discount>=? AND totalPay<=?', [status, discount, orderSizeLimit])
      //  const result = await sql.query('SELECT * FROM wishlist where status=? AND discount>=? AND totalPay<=?', [status, discount, orderSizeLimit])
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
      
        const result = await sql.query('SELECT * FROM wishlistitems where wishlistTableId=?', [offerId])
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