import { ethers } from "ethers";
import EXCHANGE_CONTRACT_ABI from "../artifacts/contracts/Exchange.sol/Exchange.json";
import TOKEN_CONTRACT_ABI from "../artifacts/contracts/MyToken.sol/MyToken.json";

const EXCHANGE_CONTRACT_ADDRESS = "0xfAc8f852DefE5b941a4b2e5AB4c2127BD5186FfD";
const TOKEN_CONTRACT_ADDRESS = "0x83847879B0142E2354946d4f2553A569897AaCe2";

/**
 * getEtherBalance: Retrieves the ether balance of the user or the contract
 */

export const getEtherBalance = async (provider, address, contract = false) => {
  try {
    // If the caller has set the `contract` boolean to true, retrieve the balance of
    // ether in the `exchange contract`, if it is set to false, retrieve the balance
    // of the user's address
    if (contract) {
      const balance = await provider.getBalance(EXCHANGE_CONTRACT_ADDRESS);
      return balance;
    } else {
      const balance = await provider.getBalance(address);
      return balance;
    }
  } catch (err) {
    console.error(err);
    return 0;
  }
};

/**
 * getNTKTokensBalance: Retrieves the tokens in the account
 * of the provided `address`
 */
export const getNTKTokensBalance = async (provider, address) => {
  try {
    const tokenContract = new ethers.Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI.abi,
      provider
    );
    const balanceOfNTKTokens = await tokenContract.balanceOf(address);
    return balanceOfNTKTokens;
  } catch (err) {
    console.error(err);
  }
};

/**
 * getNTKLPTokensBalance: Retrieves the amount of LP tokens in the account
 * of the provided `address`
 */
export const getNTKLPTokensBalance = async (provider, address) => {
  try {
    const exchangeContract = new ethers.Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI.abi,
      provider
    );
    const balanceOfLPTokens = await exchangeContract.balanceOf(address);
    return balanceOfLPTokens;
  } catch (err) {
    console.error(err);
  }
};

/**
 * getReserveOfNTKTokens: Retrieves the amount of NTK tokens in the
 * exchange contract address
 */
export const getReserveOfNTKTokens = async (provider) => {
  try {
    const exchangeContract = new ethers.Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI.abi,
      provider
    );
    const reserve = await exchangeContract.getReserve();
    return reserve;
  } catch (err) {
    console.error(err);
  }
};
