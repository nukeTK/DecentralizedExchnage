/** @type import('hardhat/config').HardhatUserConfig */
require('dotenv').config();
require('@nomiclabs/hardhat-ethers');
const {API_KEY,PRIVATE_KEY} = process.env;
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
  }
};