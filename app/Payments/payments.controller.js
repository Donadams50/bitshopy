const Items = require('../Items/items.model.js');
const Members = require('../Members/members.model.js');
const Payments = require('../Payments/payments.model.js');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const  BlockIo = require('block_io');
const version = 2;
 const block_io = new BlockIo(process.env.api_key, process.env.secret_pin, version);

 const uuid = require('uuid')

// get btc address to pay into
exports.getAddress = async(req, res) =>{
  
    try{  
      
        
        let label = uuid.v4()
         
          getAddress = await axios.get( 'https://block.io/api/v2/get_new_address/?api_key='+process.env.api_key+'&label='+label+'' ) 
          console.log(getAddress.data)
    //    getAddress = await axios.get( 'https://www.amazon.com/progress-tracker/package/ref=ppx_yo_dt_b_track_package?_encoding=UTF8&itemId=lilooqimtpkpwn&orderId=113-7405363-0300238&packageIndex=0&shipmentId=DsWK8pBzT&vt=YOUR_ORDERS' ) 
    // // console.log(getAddress.data)
    //    let wishlist =  JSON.stringify(getAddress.data)
    //    let re = /(Delivered\s\<\w+\s\w+\=\"\w+\"\>\w+\s\d+)/g;

    //     let found = getAddress.data.match(re);
    //             if(found === null){
    //                 let re5= /(Shipped\s\<\w+\s\w+\=\"\w+\"\>\w+\,\s\w+\s\d+)/g;     
                    
    //             let found5 =  getAddress.data.match(re5);
               
    //             if(found5 === null){
    //                 let re6= /(Ordered\s\<\w+\s\w+\=\"\w+\"\>\w+\,\s\w+\s\d+)/g;     
                    
    //             let found6 =  getAddress.data.match(re6);
    //             console.log(found6);
    //             wid = found6[0]
    //             status = "Not shipped yet"
    //             console.log(wid)
    //             } else{
    //                 console.log(found5);
    //                 wid = found5[0]
    //                 console.log(wid)
    //                 status = "Shipped"
    //             }
                
    //         } else{
    //             console.log(found);
    //             wid = found[0]
    //             console.log(wid)
    //             status = "Delivered"
    //         }
       
             res.status(200).send(getAddress.data)
             }
       
    catch(err){
     console.log(err)
        res.status(500).send({message:"issues while getting address"})
        
    }
  
    
}
// get transaction history
exports.getTransactionHistory = async(req, res) =>{
  
    try{  
         
        const alltransaction = await Payments.getTransactionHistory(req.user.id )
        if (alltransaction.length > 0){
    
            res.status(200).send(alltransaction)
        }else if(alltransaction.length=== 0){
           
                 res.status(204).send(alltransaction)
             }
        else{
            
            res.status(400).send({message:"error while getting transactions"}) 
        }
  
    
     }
       
    catch(err){
     console.log(err)
        res.status(500).send({message:"issues while getting transaction history"})
        
    }
  
    
}

// post/initailise payment

exports.postPayment = async(req,res)=>{
    if (!req.body){
        res.status(400).send({message:"Content cannot be empty"});
    }
console.log(req.body)

   
    const { receiverAddress } = req.body;
   // var userId = decoded.id;
    if (receiverAddress ){
        if ( receiverAddress==="" ){
            res.status(400).send({
                message:"Incorrect entry format"
            });
        }else{
            
            try{          
                     let type = "Deposit"               
                     let status = "Pending";
                     let transactionDate = new Date();
                     let noOfCheck = 0;

                     const createtransaction =await Payments.createTransaction( type, status,transactionDate,  receiverAddress, noOfCheck, req.user.id)
                     res.status(200).send({message:"Details gotten. make your payment to the address given to you now "})
    
                    
                
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


// post/initailise payment

exports.withdrawPayment = async(req,res)=>{
    if (!req.body){
        res.status(400).send({message:"Content cannot be empty"});
    }
console.log(req.body)

   
    const { amountBtc, receiverAddress } = req.body;
   // var userId = decoded.id;
    if (amountBtc &&  receiverAddress ){
        if (amountBtc==="" || receiverAddress==="" ){
            res.status(400).send({
                message:"Incorrect entry format"
            });
        }else{
            
            try{   
                
                const userDetails2 = await Members.findDetailsById(req.user.id)
                if (userDetails2[0].walletBalanceBtc <= amountBtc){
                    res.status(400).send({message:"Insufficient fund "})
                }else{
                    withdraw = await axios.post( 'https://block.io/api/v2/withdraw/?api_key='+process.env.api_key+'&amounts='+amountBtc+'&to_addresses='+receiverAddress+'' ) 
                    console.log(withdraw.data)
                   if(withdraw.data.status === "success"){
                    const initailBalanceBtc = userDetails2[0].walletBalanceBtc
                    const initailBalanceUsd = userDetails2[0].walletBalanceUsd
                    const noOfTransactions = parseInt(userDetails2[0].noOfTransactions) + 1
                    let finalBalanceBtc = parseFloat(initailBalanceBtc) - parseFloat(amountBtc)
                    getUsdInBitcoin = await axios.get('https://blockchain.info/ticker')  
                    console.log(getUsdInBitcoin.data.USD)
                    let amountUsd = parseFloat(getUsdInBitcoin.data.USD.last) * parseFloat(amountBtc) 
                      let finalBalanceUsd = parseFloat(getUsdInBitcoin.data.USD.last) * parseFloat(finalBalanceBtc) 
                     let type = "Withdrawer"               
                     let status = "Succes";
                     let transactionDate = new Date();
                   

                     const createtransaction =await Payments.createTransactionWithdrawer(amountBtc, amountUsd, type, status,transactionDate, receiverAddress, req.user.id, initailBalanceBtc, finalBalanceBtc)
                     const updatewallet = await Members.updateWallet(finalBalanceBtc, finalBalanceUsd, noOfTransactions, req.user.id) 
                     res.status(200).send({message:"Withdrawer succesfull, you will get an alert shortly "})
                    }
                    else if (withdraw.data.status === "fail"){
                        res.status(500).send({message:"Error while withdrawing fund "})
                    }
                    
                }    
            }catch(err){
                console.log(err)
                res.status(500).send({message:"Error while withdrawing fund "})
            }
        }
    }else{
        res.status(400).send({
            message:"Incorrect entry format"
        });
    }
}
