const Items = require('../Items/items.model.js');
const Members = require('../Members/members.model.js');
const AmazonListScraper = require('amazon-list-scraper').default;
// const scraper = new AmazonListScraper();

const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const winston = require('winston');
const uuid = require('uuid')

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
      //
      // - Write all logs with level `error` and below to `error.log`
      // - Write all logs with level `info` and below to `combined.log`
      //
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' })
    ]
  });

 //delay function
function delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }


//  const passwordUtils =require('../Helpers/passwordUtils');
//  const jwtTokenUtils = require('../Helpers/jwtTokenUtils')
// const sendemail = require('../Helpers/emailhelper.js');

//  const { signToken } = jwtTokenUtils;

// create member
exports.create = async(req,res)=>{
    if (!req.body){
        res.status(400).send({message:"Content cannot be empty"});
    }
console.log(req.body)

   console.log( req.user )
    //console.log(decoded)
    const { wishlistUrl } = req.body;
   // var userId = decoded.id;
    if (wishlistUrl){
        if (wishlistUrl===""){
            res.status(400).send({
                message:"Incorrect entry format"
            });
        }else{
            
            try{ 
                let re4 = /\w{13}/g;       
                let found4 = wishlistUrl.match(re4);
                if(found4 === null){
                    let re5= /\w{12}/g;       
                let found5 = wishlistUrl.match(re5);
                wid = found5[0]
                console.log(wid)
                }else{
                    wid = found4[0]
                    console.log(wid)
                }
               // console.log(found4[0]); 
                const isWishListExist = await Items.findByWishlistId(wid, wishlistUrl)
                if (isWishListExist.length>0){
                    res.status(400).send({message:"wishlist already exist"})
                }
                   else{
               

                
              
             
            //  https://www.amazon.com/hz/wishlist/ls/V30TKCJELQ06?ref_=wl_share 
             
            
               let format ="json"
               let status = "unpurchased"
           get_wishlist = await axios.get('http://www.justinscarpetti.com/projects/amazon-wish-lister/api/?id='+wid+'&format='+format+'&reveal='+status+'' )
   console.log(get_wishlist.data)
         // get_wishlist2 = await scraper.scrape(''+url+'' )
             let totalItemAmount = 0;
             let  wishList = [];
             let finalWishlist ={}
                 finalWishlist.wishlistValid = true
               for( var i = 0; i < get_wishlist.data.length; i++){
                    

                            basic= await PersistOneByOne(get_wishlist.data[i]);
                            console.log(basic.price)
                            totalItemAmount = parseFloat(totalItemAmount) + parseFloat(basic.price);
                            console.log(totalItemAmount)
                           if(basic.itemValid === false){
                               finalWishlist.wishlistValid = false
                           }
                            wishList.push(basic);   
                            }
                            finalWishlist.totalItemAmount = totalItemAmount;
                            finalWishlist.wishlistItems = wishList
                                if (finalWishlist.wishlistValid === true){
                                    res.status(200).send(finalWishlist)
                                }else{
                                    res.status(400).send({message:"One of the item does not have a single price ", finalWishlist})
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


// create member
exports.createOffer = async(req,res)=>{
    if (!req.body){
        res.status(400).send({message:"Content cannot be empty"});
    }
console.log(req.body)
           
    const {  wishlistItems, noOfItems, shopperId, discount, originalTotalPrice, totalPay, bitshopyFee, savedFee, taxPaid, onlyPrime , shippingFee, taxFee, wishlistUrl} = req.body;
   
    let re4 = /\w{13}/g;       
    let found4 = wishlistUrl.match(re4);
    if(found4 === null){
        let re5= /\w{12}/g;       
    let found5 = wishlistUrl.match(re5);
    wishlistId = found5[0]
    }else{
        wishlistId = found4[0]
    }
    if (wishlistItems && wishlistId && noOfItems && shopperId && discount && originalTotalPrice && totalPay && bitshopyFee && savedFee && wishlistUrl){
        if ( wishlistItems ==="" || wishlistId ==="" || noOfItems==="" || shopperId==="" || discount==="" || originalTotalPrice==="" || totalPay==="" || bitshopyFee==="" || savedFee===""||wishlistUrl==="" ){
            res.status(400).send({
                message:"Incorrect entry format"
            });
        }else{
            
            try{ 
                const isWishListExist = await Items.findByWishlistId(wishlistId , wishlistUrl)
                if (isWishListExist.length>0){
                    res.status(400).send({message:"wishlist already exist"})
                }else{
                const createoffer = await Items.createOffer(wishlistId, noOfItems, shopperId, discount, originalTotalPrice, totalPay, bitshopyFee, savedFee, taxPaid, onlyPrime, shippingFee, taxFee,wishlistUrl )

              // console.log(saveduser)
            if (createoffer.insertId >=1){
                console.log("ee");
                console.log(createoffer.insertId)
                for( var i = 0; i < wishlistItems.length; i++){
                    basic= await PersistOneByOne2(wishlistItems[i], createoffer.insertId , wishlistId);
                
                  }
                  res.status(201).send({
                                message:"offer created"
                            })
            }else{
                console.log("not added")
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

// get all offer
   

exports.getAllOffer = async(req, res) =>{
  
    try{
        
      
            const allOffer = await Items.getAllOffer(req.user.id)
            if (allOffer.length > 0){
                logger.log({
                    level: 'info',
                    message: 'group added to database'
                  });
             //   console.log(allGroup.length)
                res.status(200).send(allOffer)
            }else if(allOffer.length=== 0){
           //     console.log(allGroup.length)
                res.status(204).send("No offer created yet")
            }
            else{
                logger.log({
                    level: 'info',
                    message: 'Error while getting offer'
                  });
                res.status(400).send({message:"error while getting offer"}) 
            }
           
           
          
        }
       
    catch(err){
     console.log(err)
        res.status(500).send({message:"issues while retrieving offers"})
        
    }
  
    
}

// GET all offer qualified for by a single user
exports.getAllOfferQualifiedFor= async(req, res) =>{
  console.log(req.user)
    try{
        if(req.user.level === 1){
             discount = 30;
             orderSizeLimit = 75
        }else if(req.user.level === 2){
            discount = 20;
            orderSizeLimit = 150
        }
        else if(req.user.level === 3){
            discount = 150;
            orderSizeLimit = 300
        }
        else if(req.user.level === 4){
            discount = 10;
            orderSizeLimit = 500
        }
        else if(req.user.level === 5){
            discount = 5;
            orderSizeLimit = 999
        }
        else if(req.user.level === 0){
            discount = 0;
            orderSizeLimit = 10000000
        }
            const allOffer = await Items.getAllOfferQualifiedFor(discount, orderSizeLimit,req.user.id )
            console.log(allOffer)
            if (allOffer.length > 0){
                logger.log({
                    level: 'info',
                    message: 'group added to database'
                  });
                console.log(allOffer.length)
                for( var i = 0; i < allOffer.length; i++){
                    let cors ="true"
                  let currency = "USD"
                getBtcPrice = await axios.get('https://blockchain.info/tobtc?currency='+currency+'&value='+allOffer[i].totalPay+'&cors='+cors+'' )
                    allOffer[i].btcPrice = getBtcPrice.data
                    console.log(getBtcPrice.data)
                  }
                res.status(200).send(allOffer)
            }else if(allOffer.length=== 0){
                //     console.log(allGroup.length)
                     res.status(204).send( allOffer)
                 }
            else{
                
                res.status(400).send({message:"error while getting offer"}) 
            }
           
           
          
        }
       
    catch(err){
     console.log(err)
        res.status(500).send({message:"issues while retrieving offers"})
        
    }
  
    
}
// get all item in a offer
exports.getAllItemsInOffer= async(req, res) =>{
  
    try{
        console.log(req.params.offerId)
            const allOfferItem = await Items.getAllItemsInOffer(req.params.offerId)
         //   console.log(allOfferItem)
         //   console.log(allOfferItem.offerItems.length)
            if (allOfferItem.offerItems.length > 0){
                let cors ="true"
                let currency = "USD"
              getBtcPrice = await axios.get('https://blockchain.info/tobtc?currency='+currency+'&value='+allOfferItem.offer[0].totalPay+'&cors='+cors+'' )
              allOfferItem.offer[0].btcPrice = getBtcPrice.data
                  console.log(getBtcPrice.data)
              
                res.status(200).send(allOfferItem)
            }else if(allOfferItem.offerItems.length=== 0){
           //     console.log(allGroup.length)
                res.status(204).send("No item in this wishlist")
            }
            else{
                
                res.status(400).send({message:"error while getting items in this  offer"}) 
            }
           
           
          
        }
       
    catch(err){
     console.log(err)
        res.status(500).send({message:"issues while retrieving offers"})
        
    }
  
    
}

//  function to create group one after the other
async function PersistOneByOne2(wishlistItems, wishlistTableId, wishlistId ){
 


            try{
                //create beneficiary
                await delay();
                const createitems = await Items.createItems(wishlistItems, wishlistTableId, wishlistId)
                if (createitems.insertId > 0){
                  console.log("yes inserted")
                }else{
                 console.log("not inserted")
                }
            }catch(err){
               console.log(err)
                res.status(400).send({
                    message:"Error while adding new beneficiary to table"
                })
            }

}

 // called function
 async function PersistOneByOne(getWishListData){

  try{
      await delay();
      console.log(getWishListData)
      wishlistItem = {}
                    let wishlist =  JSON.stringify(getWishListData);
                 console.log(wishlist)
             
                    let re = /(offscreen\\\"\>\$\d+\.\d+)/g;
                    let re2 = /(date-added\"\:\"\w+\s\d+\,\s\d+)/g;
                  //let re4 =  /(offscreen \d+(\,\d+)*(\.\d+))/i;

                  // let re3 = /alert (on xxxxxx\d+)/i;
                //    let re2 = /Transaction (Reference: \*\w+\d+\/\s\d+)/i;        
                   let found = wishlist.match(re);
                   let found1 = wishlist.match(re2);
               console.log(found1);
              //   console.log(found);

                console.log(found);
                if (found === null ){ 
                    itemValid = false;
                    price2 = " "
                    var res = ""
                 }
                    else{
                 if (found.length == 1){
                     itemValid = true;
                     price2 = ""
                   
                 }
                 
                 else {
                    itemValid = false;
                    price2 = found[1].substring(13)
                }
                var res = found[0].substring(13)
            
            }
            var res1 = found1[0].substring(13);
            var  res2   = res1.replace(/,/g, '')
                  
                 //onsole.log(getWishListData)
                wishlistItem.itemName = getWishListData.name;
                wishlistItem.link = getWishListData.link;
                wishlistItem.priority = getWishListData.priority;
                wishlistItem.rating = getWishListData.rating;
                wishlistItem.imgUrl = getWishListData.picture;
                wishlistItem.comment = getWishListData.comment;
                wishlistItem.itemValid = itemValid;
                wishlistItem.price  = res;
                wishlistItem.dateAdded = res2;
                wishlistItem.price2= price2



                  return wishlistItem;

      
  }catch(err){
     console.log(err)
      // res.status(400).send({
      //     message:"Error while getting service charge"
      // })
  }

}  
// accept offer
exports.acceptOfferTemp = async(req,res)=>{
    if (!req.body){
        res.status(400).send({message:"Content cannot be empty"});
    }
console.log(req.body)

  // console.log( req.user )
    //console.log(decoded)

    

    
    
       
            
            try{ 
                const isUserHasPendingOffer = await Items.UserHasPendingOffer(req.user.id)
                console.log(isUserHasPendingOffer)
                if (isUserHasPendingOffer.length>0){
                    res.status(409).send({message:"User alaready has a pending accepted offer, complete the current offer and try again"})
                }
            else{
        
            console.log(req.user.id)
             let   status = "Accepted";
             console.log(req.user.id)
             console.log(req.params.offerId)
             
            
          
             const createorder = await Items.acceptOfferTemp( req.params.offerId, status, req.user.id)
          //   console.log(createorder.affectedRows)
             if (createorder.affectedRows === 1){
                res.status(200).send( {message:"Temporary Offer Accepted succesfully"})
                               
             }else{
                res.status(400).send({
                    message:" Temporary Accept Offer not succesfully"
                });
             }            
            }      
            }catch(err){
                console.log(err)
                res.status(500).send({message:"Error while accepting offer temporarily "})
            }
       
   


}
// cancel temp offer
exports.cancelOfferTemp = async(req,res)=>{
   
            
            try{ 
               const isUserHasPendingOffer = await Items.UserHasPendingOffer(req.user.id)
               console.log(isUserHasPendingOffer.length)
                if (isUserHasPendingOffer.length<0){
                    res.status(400).send({message:"user does not have any offer to cancel"})
                }
           else{
        
            
             let   status = "Pending"
             let   earnerId = " "
            
          
             const createorder = await Items.acceptOfferTemp( req.params.offerId, status, earnerId)
             if (createorder.affectedRows === 1){
                res.status(200).send( {message:"Temporary Offer cancelled succesfully"})
                               
             }else{
                res.status(400).send({
                    message:" Temporary cancellation of  Offer not succesfully"
                });
             }            
           }
              
            }catch(err){
                console.log(err)
                res.status(500).send({message:"Error while accepting offer temporarily "})
            }
        }
    
    



// accept offer
exports.acceptOffer = async(req,res)=>{
    if (!req.body){
        res.status(400).send({message:"Content cannot be empty"});
    }
        console.log(req.body)

    const { amazonOrderId, shopperId, earnerId, wishlistTableId, deliveryDate, wishlistId, orderLink} = req.body;

    
    if (amazonOrderId &&shopperId && earnerId && wishlistTableId && deliveryDate && wishlistId && orderLink ){
        if ( amazonOrderId==="" ||shopperId  ==="" || earnerId==="" || wishlistTableId ==="" || deliveryDate===""|| wishlistId==="" || orderLink ===""){
            res.status(400).send({
                message:"Incorrect entry format"
            });
        }else{
            
            try{ 
                const isUserHasPendingOffer = await Items.UserHasPendingOffer(req.user.id)
                console.log(isUserHasPendingOffer.length)
                if (isUserHasPendingOffer.length<0){
                    res.status(400).send({message:"User does not have any offer to confirm"})
                }
           else{
        
             let   bitshopyOrderId = uuid.v4();
             let   status = "Waiting for confimation"
             let   orderDate = new Date();
             const createorder = await Items.acceptOffer(amazonOrderId, shopperId, earnerId, wishlistTableId,  bitshopyOrderId,  status, deliveryDate,wishlistId, orderLink, orderDate)
                  
             if (createorder.insertId > 0){
                res.status(201).send( {message:"Offer Accepted succesfully"})
                               
             }else{
                res.status(400).send({
                    message:" Accept Offer not succesfully"
                });
             }            
           }      
            }catch(err){
                console.log(err)
                res.status(500).send({message:"Error while accepting offer "})
            }
        }
    }else{
        res.status(400).send({
            message:"Incorrect entry format"
        });
    }


}

// GET all order
exports.getOrder = async(req, res) =>{
  
    try{
        
      
            const allOrder = await Items.getOrder(req.user.id)
            if (allOrder.length > 0){
                res.status(200).send(allOrder)
            }else if(allOrder.length=== 0){

                res.status(204).send("No Order created yet")
            }
            else{
               
                res.status(400).send({message:"error while getting Order"}) 
            }  
        }
       
    catch(err){
     console.log(err)
        res.status(500).send({message:"issues while retrieving offers"})
        
    }
  
    
}

// GET all order
exports.getBtcRate = async(req, res) =>{
  
    try{   
      getBtcRate = await axios.get('https://api.coindesk.com/v1/bpi/currentprice/USD.json' )
      
        res.status(200).send(getBtcRate.data.bpi.USD)
        }
       
    catch(err){
     console.log(err)
        res.status(500).send({message:"issues while retrieving offers"})
        
    }
  
    
}
