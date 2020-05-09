const Items = require('../Items/items.model.js');
const Members = require('../Members/members.model.js');
const AmazonListScraper = require('amazon-list-scraper').default;
// const scraper = new AmazonListScraper();

const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const winston = require('winston');

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
                console.log(found4[0]); 
              
             
            //  https://www.amazon.com/hz/wishlist/ls/3CFEKJ4MI59IW?ref_=wl_share 
             
              let com = ".com"
               let format ="json"
               let status = "unpurchased"
           get_wishlist = await axios.get('http://www.justinscarpetti.com/projects/amazon-wish-lister/api/?id='+found4[0]+'&format='+format+'&reveal='+status+'' )

         // get_wishlist2 = await scraper.scrape(''+url+'' )
               wishList = [];
          
               for( var i = 0; i < get_wishlist.data.length; i++){
                    

                            basic= await PersistOneByOne(get_wishlist.data[i]);
                           
                            wishList.push(basic);   
                            }
               

                                 res.status(200).send(wishList)
                       

    
                    
                
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
    const {  wishlistItems, wishlistId, noOfItems, shopperId, discount, originalTotalPrice, totalPay, bitshopyFee, savedFee, taxPaid, onlyPrime } = req.body;
    if (wishlistItems && wishlistId && noOfItems && shopperId && discount && originalTotalPrice && totalPay && bitshopyFee && savedFee){
        if ( wishlistItems ==="" || wishlistId ==="" || noOfItems==="" || shopperId==="" || discount==="" || originalTotalPrice==="" || totalPay==="" || bitshopyFee==="" || savedFee==="" ){
            res.status(400).send({
                message:"Incorrect entry format"
            });
        }else{
            
            try{ 
                let re4 = /\w{13}/g;       
                let found4 = wishlistId.match(re4);
                console.log(found4[0]); 

                const createoffer = await Items.createOffer(wishlistId, noOfItems, shopperId, discount, originalTotalPrice, totalPay, bitshopyFee, savedFee, taxPaid, onlyPrime)

              // console.log(saveduser)
            if (createoffer.insertId >=1){
                console.log("ee");
                console.log(createoffer.insertId)
                for( var i = 0; i < wishlistItems.length; i++){
                    basic= await PersistOneByOne2(wishlistItems[i], createoffer.insertId , wishlistId);
                
                  }
                  res.status(201).send({
                                message:"beneficiaries added to table"
                            })
            }else{
                console.log("not added")
                }

                                 res.status(200).send(wishList)
   


                    
                
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
   
// GET all group
exports.getAllOffer = async(req, res) =>{
  
    try{
        
      
            const allOffer = await Items.getAllOffer()
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

// GET all group
exports.getAllOfferQualifiedFor= async(req, res) =>{
  
    try{
        if(req.params.userLevel === 1){
             discount = 30;
             orderSizeLimit = 75
        }else if(req.params.userLevel === 2){
            discount = 20;
            orderSizeLimit = 150
        }
        else if(req.params.userLevel === 3){
            discount = 150;
            orderSizeLimit = 300
        }
        else if(req.params.userLevel === 4){
            discount = 10;
            orderSizeLimit = 500
        }
        else if(req.params.userLevel === 5){
            discount = 5;
            orderSizeLimit = 999
        }
      
            const allOffer = await Items.getAllOfferQualifiedFor(discount, orderSizeLimit)
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
             //   console.log(found1);
              //   console.log(found);

                console.log(found);
                if (found === null ){ 
                    itemValid = false;
                    price2 = " "
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