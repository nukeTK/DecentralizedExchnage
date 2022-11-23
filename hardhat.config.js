/** @type import('hardhat/config').HardhatUserConfig */
require('dotenv').config();
require('@nomiclabs/hardhat-ethers');
require("@nomiclabs/hardhat-etherscan");
const {API_KEY,PRIVATE_KEY,ETHERSCAN_API_KEY} = process.env;
module.exports = {
  solidity: "0.8.9",
  networks:{
    goerli:{
      url:`${API_KEY}`,
      accounts:[`0x${PRIVATE_KEY}`]
    }
  },
  paths:{
    artifacts:'./frontend/src/artifacts'
  },
  etherscan:{
    apikey:`${ETHERSCAN_API_KEY}`
  }
};