const dotenv=require('dotenv');
const axios = require('axios');

dotenv.config();

exports.getConversionInBtc= async function(valueUsd) {
    let cors ="true"
    let currency = "USD"
  getBtcPrice = await axios.get('https://blockchain.info/tobtc?currency='+currency+'&value='+valueUsd+'&cors='+cors+'' )
      allOffer[i].btcPrice = getBtcPrice.data
      console.log(getBtcPrice.data)
    
    return getBtcPrice.data;
  }

  exports.getConversionInUsd=async function (valueBtc){
    getUsdInBitcoin = await axios.get('https://blockchain.info/ticker')  
    console.log(getUsdInBitcoin.data.USD)
    let amountUsd = parseFloat(getUsdInBitcoin.data.USD.last) * parseFloat(valueBtc) 
    console.log("amountUsd")
    console.log(amountUsd)
    return amountUsd;
  }
