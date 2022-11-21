import { Contract,utils } from "ethers";
import EXCHANGE_CONTRACT_ABI from "../artifacts/contracts/Exchange.sol/Exchange.json";
import TOKEN_CONTRACT_ABI from "../artifacts/contracts/MyToken.sol/MyToken.json";
const EXCHANGE_CONTRACT_ADDRESS = "0xfAc8f852DefE5b941a4b2e5AB4c2127BD5186FfD";
const TOKEN_CONTRACT_ADDRESS = "0x83847879B0142E2354946d4f2553A569897AaCe2";

export const addLiquidity = async (
    signer,
    addNTKAmountWei,
    addEtherAmountWei
  ) => {
    try {
      // create a new instance of the token contract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI.abi,
        signer
      );
      // create a new instance of the exchange contract
      const exchangeContract = new Contract(
        EXCHANGE_CONTRACT_ADDRESS,
        EXCHANGE_CONTRACT_ABI.abi,
        signer
      );
      // Because NTK tokens are an ERC20, user would need to give the contract allowance
      // to take the required number NTK tokens out of his contract
      let tx = await tokenContract.approve(
        EXCHANGE_CONTRACT_ADDRESS,
        addNTKAmountWei.toString()
      );
      await tx.wait();
      // After the contract has the approval, add the ether and NTK tokens in the liquidity
      tx = await exchangeContract.addLiquidity(addNTKAmountWei, {
        value: addEtherAmountWei,
      });
      await tx.wait();
    } catch (err) {
      console.error(err);
    }
  };
  
  /**
   * calculateNTK calculates the NTK tokens that need to be added to the liquidity
   * given `_addEtherAmountWei` amount of ether
   */
  export const calculateNTK = async (
    _addEther = "0",
    etherBalanceContract,
    NTKTokenReserve
  ) => {
    // `_addEther` is a string, we need to convert it to a Bignumber before we can do our calculations
    // We do that using the `parseEther` function from `ethers.js`
    const _addEtherAmountWei = utils.parseEther(_addEther);
  
    // Ratio needs to be maintained when we add liquidty.
    // We need to let the user know for a specific amount of ether how many `NTK` tokens
    // He can add so that the price impact is not large
    // The ratio we follow is (amount of NUKETK tokens to be added) / (NUKETK tokens balance) = (Eth that would be added) / (Eth reserve in the contract)
    // So by maths we get (amount of NUKETK tokens to be added) = (Eth that would be added * NUKETK tokens balance) / (Eth reserve in the contract)
  
    const nuketkTokenAmount = _addEtherAmountWei
      .mul(NTKTokenReserve)
      .div(etherBalanceContract);
    return nuketkTokenAmount;
  };