const Items = require('../Items/items.model.js');
const Members = require('../Members/members.model.js');
const Payments = require('../Payments/payments.model.js');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const  BlockIo = require('block_io');
const version = 2; // API version
 const block_io = new BlockIo(process.env.api_key, process.env.secret_pin, version);

 const uuid = require('uuid')

// get btc address to pay into
exports.getAddress = async(req, res) =>{
  
    try{  
      
        
        let label = uuid.v4()
         
          getAddress = await axios.get( 'https://block.io/api/v2/get_new_address/?api_key='+process.env.api_key+'&label='+label+'' ) 
          console.log(getAddress.data)
    //    getAddress = await axios.get( 'https://www.amazon.com/progress-tracker/package/ref=ppx_yo_dt_b_track_package?_encoding=UTF8&itemId=lhslmolqtlttwn&orderId=114-0911325-3822665&shipmentId=UfFgRK2kJ&vt=YOUR_ORDERS' ) 
       // console.log(getAddress.data)
     //   let wishlist =  JSON.stringify(getAddress.data)
    //    let re = /(milestone-primaryMessage\"\>\w+\<\/\w+\>)/g;

        // let found = getAddress.data.match(re);
        // console.log(found);
  
             res.status(200).send(getAddress.data)
            }
       
    catch(err){
     console.log(err)
        res.status(500).send({message:"issues while getting address"})
        
    }
  
    
}

// post/initailise payment

exports.postPayment = async(req,res)=>{
    if (!req.body){
        res.status(400).send({message:"Content cannot be empty"});
    }
console.log(req.body)

   
    const { amountBtc, senderAddress, receiverAddress } = req.body;
   // var userId = decoded.id;
    if (amountBtc && senderAddress && receiverAddress ){
        if (amountBtc==="" || senderAddress===""  || receiverAddress==="" ){
            res.status(400).send({
                message:"Incorrect entry format"
            });
        }else{
            
            try{          
                     let type = "Deposit"               
                     let status = "Pending";
                     let transactionDate = new Date();
                     let noOfCheck = 0;

                     const createtransaction =await Payments.createTransaction(amountBtc, type, status,transactionDate, senderAddress , receiverAddress, noOfCheck, req.user.id)
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
                    withdraw = await axios.get( 'https://block.io/api/v2/withdraw/?api_key='+process.env.api_key+'&amounts='+amountBtc+'&to_addresses='+amountBtc+'' ) 
                    console.log(getAddress.data)
                   if(withdraw.data.status === "success"){
                    const initailBalanceBtc = userDetails2[0].walletBalanceBtc
                    const initailBalanceUsd = userDetails2[0].walletBalanceUsd
                    const noOfTransactions = parseInt(userDetails2[0].noOfTransactions) + 1
                    let finalBalanceBtc = parseFloat(initailBalanceBtc) - parseFloat(amountBtc)
                    getUsdInBitcoin = await axios.get('https://blockchain.info/ticker')  
                    console.log(getUsdInBitcoin.data.USD)
                    let amountUsd = parseFloat(getUsdInBitcoin.data.USD.last) * parseFloat(amountBtc) 
                      let finalBalanceUsd = parseFloat(getUsdInBitcoin.USD.last) * parseFloat(finalBalanceBtc) 
                     let type = "Withdrawer"               
                     let status = "Succesful";
                     let transactionDate = new Date();
                   

                     const createtransaction =await Payments.createTransactionWithdrawer(amountBtc, amountUsd, type, status,transactionDate, receiverAddress, req.user.id, initailBalanceBtc, finalBalanceBtc)
                     const updatewallet = await Members.updateWallet(finalBalanceBtc, finalBalanceUsd, noOfTransactions,req.user.id) 
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
// /api/v2/withdraw/?api_key=API KEY&amounts=AMOUNT1,AMOUNT2,...&to_addresses=ADDRESS1,ADDRESS2,...