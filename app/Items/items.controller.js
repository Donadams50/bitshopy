const Items = require('../Items/items.model.js');
const Members = require('../Members/members.model.js');
const Payments = require('../Payments/payments.model.js');
const AmazonListScraper = require('amazon-list-scraper').default;
// const scraper = new AmazonListScraper();
const btcconversion = require('../Helpers/btcconversion')
const { getConversionInBtc } = btcconversion;
const { getConversionInUsd } = btcconversion;
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
                const upperCaseWords = wishlistUrl.match(/(\b[A-Z0-9][A-Z0-9]+|\b[A-Z]\b)/g);
                   //     console.log(upperCaseWords[0])
                        wid = upperCaseWords[0]
                console.log(wid)
                // let re4 = /\w{13}/g;       
                // let found4 = wishlistUrl.match(re4);
                // if(found4 === null){
                //     let re5= /\w{12}/g;       
                // let found5 = wishlistUrl.match(re5);
                // wid = found5[0]
                // console.log(wid)
                // }else{
                //     wid = found4[0]
                //     console.log(wid)
                // }
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
             if (get_wishlist.data === null){
                res.status(400).send({message:"Invalid wishlist url"})
             }else{
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
                        }
                    
                
            }catch(err){
                console.log(err)
                res.status(500).send({message:"Server error "})
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
   
    // let re4 = /\w{13}/g;       
    // let found4 = wishlistUrl.match(re4);
    // if(found4 === null){
    //     let re5= /\w{12}/g;       
    // let found5 = wishlistUrl.match(re5);
    // wishlistId = found5[0]
    // }else{
    //     wishlistId = found4[0]
    // }
    const upperCaseWords = wishlistUrl.match(/(\b[A-Z0-9][A-Z0-9]+|\b[A-Z]\b)/g);
                        console.log(upperCaseWords[0])
                        wishlistId = upperCaseWords[0]
    if (wishlistItems && wishlistId && noOfItems && shopperId && discount && originalTotalPrice && totalPay && bitshopyFee && savedFee && wishlistUrl){
        if ( wishlistItems ==="" || wishlistId ==="" || noOfItems==="" || shopperId==="" || discount==="" || originalTotalPrice==="" || totalPay==="" || bitshopyFee==="" || savedFee===""||wishlistUrl==="" ){
            res.status(400).send({
                message:"Incorrect entry format"
            });
        }else{
            
            try{ 
                const userDetails2 = await Members.findDetailsById(shopperId)
                const walletbalancebtcTotalPay = await getConversionInBtc(totalPay)
                if (userDetails2[0].walletBalanceBtc <= walletbalancebtcTotalPay){
                    res.status(400).send({message:"Insufficient Fund"})
                }
                // else if(totalPay > 999 || totalPay< 3.99){
                //     res.status(400).send({message:"Listing amount too low or too high"})
                // }
                else{
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
                  const userDetails2 = await Members.findDetailsById(shopperId)
                  if (userDetails2.length>0){
                      console.log(userDetails2[0].walletBalanceBtc)
                      console.log(userDetails2[0].walletBalanceBtc)
                      console.log(userDetails2[0].noOfTransactions)
                      console.log(userDetails2[0].escrowWalletBtc)
                      let type = "Spent"
                      let status = "Success"
                      let transactionDate = new Date();
                      let cors ="true"
                      let currency = "USD"
                      const initailBalanceBtc = userDetails2[0].walletBalanceBtc
                      const initailBalanceUsd = userDetails2[0].walletBalanceUsd
                      const initialescrowWalletUsd = userDetails2[0].escrowWalletUsd
                      const noOfTransactions = parseInt(userDetails2[0].noOfTransactions) + 1
                      const getBtcPrice = await axios.get('https://blockchain.info/tobtc?currency='+currency+'&value='+totalPay+'&cors='+cors+'' )
                        amountBtc = getBtcPrice.data
                        console.log(getBtcPrice.data)
                        let finalBalanceBtc = parseFloat(initailBalanceBtc) - parseFloat(amountBtc)
                        let  finalEscrowWalletUsd = parseFloat(initialescrowWalletUsd) + parseFloat(totalPay)
                        getUsdInBitcoin = await axios.get('https://blockchain.info/ticker')  
                        console.log(getUsdInBitcoin.data.USD.last)
                          let finalBalanceUsd = parseFloat(getUsdInBitcoin.data.USD.last) * parseFloat(finalBalanceBtc) 
                    


                    const createtransaction =await Payments.createTransactionSpend(totalPay, type, status, transactionDate, shopperId , createoffer.insertId, amountBtc, initailBalanceBtc, finalBalanceBtc)
                    const updatewallet = await Members.updateWalletEscrow(finalBalanceBtc, finalBalanceUsd, noOfTransactions, shopperId, finalEscrowWalletUsd) 
                }else{
                    console.log("user not found")
                }
                  
                  res.status(201).send({
                                message:"offer created"
                            })
            }else{
                console.log("not added")
                }

                        
   
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

   let { type} = req.query;
   console.log(type)
  if (type === "unchecked"){
    const allOffer = await Items.getAllOffer(req.user.id )
    console.log(allOffer)
    if (allOffer.length >= 0){
        console.log(allOffer.length)
        for( var i = 0; i < allOffer.length; i++){
            let cors ="true"
          let currency = "USD"
        getBtcPrice = await axios.get('https://blockchain.info/tobtc?currency='+currency+'&value='+allOffer[i].totalPay+'&cors='+cors+'' )
            allOffer[i].btcPrice = getBtcPrice.data
            console.log(getBtcPrice.data)
            if(req.user.level === 1 && (allOffer[i].discount < 30 || allOffer[i].totalPay >75)){
                allOffer[i].levelUp = true
           }else if(req.user.level === 2 && (allOffer[i].discount < 20 || allOffer[i].totalPay >150)){
            allOffer[i].levelUp = true
           }
           else if(req.user.level === 3 && (allOffer[i].discount < 15 || allOffer[i].totalPay >300)){
            allOffer[i].levelUp = true
           }
           else if(req.user.level === 4 && (allOffer[i].discount < 10 || allOffer[i].totalPay >500)){
            allOffer[i].levelUp = true
           }
           else if(req.user.level === 5 && (allOffer[i].discount < 5 || allOffer[i].totalPay >999)){
            allOffer[i].levelUp = true
           }
           

          }

        res.status(200).send(allOffer)
    }
    else{
        
        res.status(400).send({message:"error while getting offer"}) 
    }
}else if (type === "checked"){
 
  
    try{
        if(req.user.level === 1){
             discount = 30;
             orderSizeLimit = 75
        }else if(req.user.level === 2){
            discount = 20;
            orderSizeLimit = 150
        }
        else if(req.user.level === 3){
            discount = 15;
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
            if (allOffer.length >= 0){
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
    
}
// get all item in a offer
exports.getAllItemsInOffer= async(req, res) =>{
  
    try{
        console.log(req.params.offerId)
            const allOfferItem = await Items.getAllItemsInOffer(req.params.offerId, req.user.id)
           console.log(allOfferItem)
         //   console.log(allOfferItem.offerItems.length)
            if (allOfferItem.offerItems.length > 0){
                //const allmesages = await Items.getAllMessages(req.params.offerId)
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
      //console.log(getWishListData)
      wishlistItem = {}
                    let wishlist =  JSON.stringify(getWishListData);
                 console.log(wishlist)
             
                    let re = /(offscreen\\\"\>\$\d+\.\d+)/g;
                   // let re2 = /(date-added\"\:\"\w+\s\d+\,\s\d+)/g;

                   let found = wishlist.match(re);
                 //  let found1 = wishlist.match(re2);
                  //console.log(found1);
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
          //  var res1 = found1[0].substring(13);
         //   var  res2   = res1.replace(/,/g, '')
                  
                 //onsole.log(getWishListData)
                wishlistItem.itemName = getWishListData.name;
                wishlistItem.link = getWishListData.link;
                wishlistItem.priority = getWishListData.priority;
                wishlistItem.rating = getWishListData.rating;
                wishlistItem.imgUrl = getWishListData.picture;
                wishlistItem.comment = getWishListData.comment;
                wishlistItem.itemValid = itemValid;
                wishlistItem.price  = res;
              //  wishlistItem.dateAdded = res2;
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
             let exactAcceptTime =  new Date();
            
          
             const createorder = await Items.acceptOfferTemp( req.params.offerId, status, req.user.id, exactAcceptTime)
          //   console.log(createorder.affectedRows)
             if (createorder.affectedRows === 1){

                const getwishlistbyid = await Items.findWishlistById( req.params.offerId)
                console.log(getwishlistbyid[0].shopperId)

                 let text =  ''+req.user.username+' accepted offer'
                const sendmessage = await Items.sendMessage( req.params.offerId, text, req.user.id, status, getwishlistbyid[0].shopperId)
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
            let exactAcceptTime =" "
          
             const createorder = await Items.acceptOfferTemp( req.params.offerId, status, earnerId, exactAcceptTime)
             if (createorder.affectedRows === 1){
           //     const getwishlistbyid = await Items.findWishlistById( req.params.offerId)

            
                console.log(getwishlistbyid[0].shopperId)

                 const deletemessage = await Items.deleteMessage( req.params.offerId)
                // console.log(getwishlistbyid.shopperId)
                // let text =  ''+req.user.username+' cancel offer'
                // const sendmessage = await Items.sendMessage( req.params.offerId, text, req.user.id)
                
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
    console.log(wishlistTableId)
    
    if (amazonOrderId &&shopperId && earnerId && wishlistTableId && deliveryDate && wishlistId && orderLink ){
        if ( amazonOrderId==="" ||shopperId  ==="" || earnerId==="" || wishlistTableId ==="" || deliveryDate===""|| wishlistId==="" || orderLink ===""){
            res.status(400).send({
                message:"Incorrect entry format"
            });
        }else{
            
            try{ 
                const getwishlistbyid = await Items.findWishlistById( wishlistTableId)
              //  console.log(getwishlistbyid[0].status)
                if(getwishlistbyid[0].status === "Pending"){
                    res.status(400).send({message:"Your time has elasped"})
                }
                else{
                const isUserHasPendingOffer = await Items.UserHasPendingOffer(req.user.id)
               // console.log(isUserHasPendingOffer.length)
                if (isUserHasPendingOffer.length === 0){
                    res.status(400).send({message:"User does not have any offer to confirm"})
                }
           else{
            const getwishlistbyid = await Items.findWishlistById( wishlistTableId)
            var today = new Date();
  var Difference_In_Time = today.getTime() - getwishlistbyid[0].exactAcceptTime.getTime();
//console.log(Difference_In_Time)
   diffInMinutes = millisToMinutesAndSeconds(Difference_In_Time)
   //console.log(diffInMinutes)
if (diffInMinutes > 30 || getwishlistbyid[0].status !="Accepted" ){
    res.status(400).send({message:"Your time has elapsed"})
}else{
             let   bitshopyOrderId = uuid.v4();
             let   status = "Waiting for confirmation"
             let   orderDate = new Date();
             const createorder = await Items.acceptOffer(amazonOrderId, shopperId, earnerId, wishlistTableId,  bitshopyOrderId,  status, deliveryDate,wishlistId, orderLink, orderDate)
                  
             if (createorder.insertId > 0){
             
                console.log(getwishlistbyid.shopperId)
                 
                let text =  ''+req.user.username+' submitted order #'+amazonOrderId+'  delivery date  '+deliveryDate+' and Order link  '+orderLink+' '
                const sendmessage = await Items.sendMessage( wishlistTableId, text, req.user.id, status, getwishlistbyid[0].shopperId)
                res.status(201).send( {message:"Offer Accepted succesfully"})
                               
             }else{
                res.status(400).send({
                    message:" Accept Offer not succesfully"
                });
             } 
            }           
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
        let { type} = req.query;
        console.log(type)
        console.log(req.user.id)
        if (!type){
            res.status(400).send({message:"a type of active or previous must be sent"}) 
        }else{
      
            const allOrder = await Items.getOrder(req.user.id, type )
            console.log(allOrder)
            if (allOrder.length > 0){
               
              //  console.log(allOrder[0])
                for( var i = 0; i < allOrder.length; i++){
                 const allunread = await Items.getUnread(allOrder[i].id, req.user.id)
                 console.log(allunread)
                 allOrder[i].messageCount = allunread.length; 
                  const imgurl = await Items.getImageUrl(allOrder[i].id )
                    console.log(imgurl[0])
                    allOrder[i].imgUrl  = imgurl
                   let savedFeePercent = (parseFloat(allOrder[i].savedFee) /parseFloat(allOrder[i].originalTotalPrice) * 100)
                   allOrder[i].savedFeePercent = savedFeePercent                  
                  }
                  console.log(allOrder)
                res.status(200).send(allOrder)
               
            }else if(allOrder.length=== 0){

                res.status(204).send("No Order created yet")
            }
            else{
               
                res.status(400).send({message:"error while getting Order"}) 
            }  
        }
    }
       
    catch(err){
     console.log(err)
        res.status(500).send({message:"issues while retrieving offers"})
        
    }
  
    
}



// shopper cancel transaction
exports.shopperCancelOffer = async(req,res)=>{
   
            
    try{ 
       const isUserHasPendingOffer = await Items.shopperHasPendingOffer(req.user.id)
       console.log(isUserHasPendingOffer.length)
        if (isUserHasPendingOffer.length<0){
            res.status(400).send({message:"user does not have any offer to cancel"})
        }
   else{

    

    const userDetails2 = await Members.findDetailsById(req.user.id)
    if (userDetails2.length>0){

        const offerbyid = await Items.findPendingWishlistById(req.params.offerId)
        if(offerbyid[0].status != "Pending"){
            res.status(400).send({message:"You can not cancel this offer again, it has been accepted"})
        } else{
        const totalPay = offerbyid[0].totalPay;
        const initailBalanceBtc = userDetails2[0].walletBalanceBtc
        const initailBalanceUsd = await getConversionInUsd(initailBalanceBtc) 
        const initialescrowWalletUsd = userDetails2[0].escrowWalletUsd
        const noOfTransactions = parseInt(userDetails2[0].noOfTransactions) - 1
        // console.log(initailBalanceUsd)
        // console.log(userDetails2[0].walletBalanceBtc)
        // console.log(totalPay)
      //  console.log(userDetails2[0].noOfTransactions)
        const totalPayBtc = await getConversionInBtc(totalPay)
        console.log(totalPayBtc)
     console.log(userDetails2[0].escrowWalletBtc) 
        let  finalEscrowWalletUsd = parseFloat(initialescrowWalletUsd) - parseFloat(totalPay)
    let finalBalanceBtc = parseFloat(initailBalanceBtc) + parseFloat(totalPayBtc)
    const finalBalanceUsd = await getConversionInUsd(finalBalanceBtc) 
      
      const updatewallet = await Members.updateWalletEscrow(finalBalanceBtc, finalBalanceUsd, noOfTransactions, req.user.id, finalEscrowWalletUsd) 
      if(updatewallet.affectedRows > 0){
      const deleteoffer =await Items.deleteOffer(req.params.offerId)
         if(deleteoffer){
            res.status(200).send({message:"Succesfully cancelled transaction"}) 
         }else{
            res.status(400).send({message:"Not succesfull "})
         }
        }else{
            res.status(400).send({message:"Not succesfull "})
        }
    }
    } 
    else{
        res.status(400).send({message:"User not found"})
    }

   }
      
    }catch(err){
        console.log(err)
        res.status(500).send({message:"Error while cancel offer temporarily "})
    }
}

// shopper confirm delivery
exports.shopperConfirmDelivery = async(req,res)=>{
   
            
    try{ 
       const isUserHasPendingOffer = await Items.UserHasPendingOffer(req.user.id)
       console.log(isUserHasPendingOffer.length)
        if (isUserHasPendingOffer.length<0){
            res.status(400).send({message:"user does not have any offer to cancel"})
        }
   else{

    
    const offerbyid = await Items.findAcceptedWishlistById(req.params.offerId)
     if(offerbyid[0].status === "Cancelled")
     {
        res.status(400).send({message:"This order has been cancelled, you can not confirm delivery"})
    }else{
    const userDetails2 = await Members.findDetailsById(offerbyid[0].earnerId)
    if (userDetails2.length>0){

        
        const totalPay = offerbyid[0].totalPay;
        const initailBalanceBtc = userDetails2[0].walletBalanceBtc
        const initailBalanceUsd = await getConversionInUsd(initailBalanceBtc) 
        const noOfTransactions = parseInt(userDetails2[0].noOfTransactions) + 1
        let type = "Earned"
        let status = "Success"
        let transactionDate = new Date();
        console.log(initailBalanceUsd)
        console.log(userDetails2[0].walletBalanceBtc)
        console.log(totalPay)
        console.log(userDetails2[0].noOfTransactions)
        const totalPayBtc = await getConversionInBtc(totalPay)
        console.log(totalPayBtc) 
        
    let finalBalanceBtc = parseFloat(initailBalanceBtc) + parseFloat(totalPayBtc)
    const finalBalanceUsd = await getConversionInUsd(finalBalanceBtc) 
      
      const updatewallet = await Members.updateWallet(finalBalanceBtc, finalBalanceUsd, noOfTransactions, offerbyid[0].earnerId) 
     
      if(updatewallet.affectedRows > 0){
        const createtransaction =await Payments.createTransactionSpend(totalPay, type, status, transactionDate, offerbyid[0].earnerId , offerbyid[0].id, totalPayBtc, initailBalanceBtc, finalBalanceBtc)
      const confirmdelivery =await Items.confirmDelivery(req.params.offerId)
       let text =  ''+req.user.username+'  has confirmed delivery, and the earner wallet has been creditted'
       let status1 = "Completed"
    const sendmessage = await Items.sendMessage( req.params.offerId, text, req.user.id, status1, offerbyid[0].earnerId)
      res.status(200).send({message:"Confirm delevery succesfull "})

        }else{
            res.status(400).send({message:"Not succesfull "})
        }
    } 
    else{
        res.status(400).send({message:"User not found"})
    }

   }
}
    }catch(err){
        console.log(err)
        res.status(500).send({message:"Error while accepting offer temporarily "})
    }
}



// earner cancel offer
exports.earnerCancelOffer = async(req,res)=>{
   
    if (!req.body){
        res.status(400).send({message:"Content cannot be empty"});
    }
console.log(req.body)
           
    const {  offerId, reason} = req.body;
    
    try{ 
       const isUserHasPendingOffer = await Items.UserHasPendingOffer(req.user.id)
       console.log(isUserHasPendingOffer.length)
        if (isUserHasPendingOffer.length<0){
            res.status(400).send({message:"user does not have any offer to cancel"})
        }
   else{
       let status ="Pending"
       let earnerId= ""
       let amazonOrderId = " "
       let bitshopyOrderId = " "
       let deliveryDate = " "
       let orderLink = " "
       let orderDate = " "
        let status1 = "Cancelled"
        const cancelorder = await Items.earnerCancelOffer(status, earnerId, amazonOrderId,  bitshopyOrderId, deliveryDate, orderLink, orderDate, offerId,reason, req.user.id)
       if (cancelorder.affectedRows> 0)
         {
             const deletemessage = await Items.deleteMessage( offerId)
            // let text =  ''+req.user.username+' canceled the order, reason: '+reason+' '
            // const sendmessage = await Items.sendMessage( req.params.offerId, text, req.user.id, status1)
        res.status(200).send({message:"Cancel offer succesfull "})

      }
      else{
        res.status(400).send({message:"Not succesfull "})
      }

   }
      
    }catch(err){
        console.log(err)
        res.status(500).send({message:"Error while cancelling offer"})
    }
}

// GET all unread message
exports.getUnread = async(req, res) =>{
  
    try{
        console.log(req.params.offerId)
            const allunread = await Items.getAllMessages(req.user.id)
          
              console.log(allunread.length)
                res.status(200).send({messageCount:allunread.length })
           
          
        }
       
    catch(err){
     console.log(err)
        res.status(500).send({message:"issues while getting unread messages"})
        
    }
  
    
}

// mark Read
exports.markRead = async(req, res) =>{
  
    try{
        console.log(req.params.wishlistTableId)
            const markread = await Items.markRead(req.params.wishlistTableId, req.user.id)
          
              console.log(markread)
                res.status(200).send({message:"Succesfully mark as read"})
           
          
        }
       
    catch(err){
     console.log(err)
        res.status(500).send({message:"issues while getting unread messages"})
        
    }
  
    
}
// send message

exports.sendMessage = async(req,res)=>{
    if (!req.body){
        res.status(400).send({message:"Content cannot be empty"});
    }
        console.log(req.body)

    const { text, senderId, receiverId, wishlistTableId, status} = req.body;

    
    if (text && senderId && receiverId && wishlistTableId && status ){
        if ( text==="" ||senderId  ==="" || receiverId==="" || wishlistTableId ==="" || status===""){
            res.status(400).send({
                message:"Incorrect entry format"
            });
        }else{
            
            try{ 
                    
                const sendmessage = await Items.sendMessageChat( wishlistTableId, text, senderId, status, receiverId)
                  
             if (sendmessage.insertId > 0){
                
                res.status(201).send( {message:"message sent succesfully"})
                               
             }else{
                res.status(400).send({
                    message:" Message not sent"
                });
             }            
               
            }catch(err){
                console.log(err)
                res.status(500).send({message:"Error while sending message "})
            }
        }
    }else{
        res.status(400).send({
            message:"Incorrect entry format"
        });
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


// function to convert milli seconds to minutes
function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    
    return minutes
  }