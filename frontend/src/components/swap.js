import { Contract } from "ethers";
import EXCHANGE_CONTRACT_ABI from "../artifacts/contracts/Exchange.sol/Exchange.json";
import TOKEN_CONTRACT_ABI from "../artifacts/contracts/MyToken.sol/MyToken.json";

const EXCHANGE_CONTRACT_ADDRESS = "0xfAc8f852DefE5b941a4b2e5AB4c2127BD5186FfD";
const TOKEN_CONTRACT_ADDRESS = "0x83847879B0142E2354946d4f2553A569897AaCe2";

export const getAmountOfTokensReceivedFromSwap = async (
    _swapAmountWei,
    provider,
    ethSelected,
    ethBalance,
    reservedNTK
  ) => {
    // Create a new instance of the exchange contract
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI.abi,
      provider
    );
    let amountOfTokens;
    // If `Eth` is selected this means our input value is `Eth` which means our input amount would be
    // `_swapAmountWei`, the input reserve would be the `ethBalance` of the contract and output reserve
    // would be the `nuketk` token reserve
    if (ethSelected) {
      amountOfTokens = await exchangeContract.getAmountTokens(
        _swapAmountWei,
        ethBalance,
        reservedNTK
      );
    } else {
      // If `Eth` is not selected this means our input value is `nuketk` tokens which means our input amount would be
      // `_swapAmountWei`, the input reserve would be the `nuketk` token reserve of the contract and output reserve
      // would be the `ethBalance`
      amountOfTokens = await exchangeContract.getAmountTokens(
        _swapAmountWei,
        reservedNTK,
        ethBalance
      );
    }
  
    return amountOfTokens;
  };
  
  /*
    swapTokens: Swaps `swapAmountWei` of Eth/NTK tokens with `tokenToBeReceivedAfterSwap` amount of Eth/NTK tokens.
  */
  export const swapTokens = async (
    signer,
    swapAmountWei,
    tokenToBeReceivedAfterSwap,
    ethSelected
  ) => {
    // Create a new instance of the exchange contract
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI.abi,
      signer
    );
    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI.abi,
      signer
    );
    let tx;
    // If Eth is selected call the `ethToNTKtokens` function else
    // call the `NTKToEth` function from the contract
    // As you can see you need to pass the `swapAmount` as a value to the function because
    // it is the ether we are paying to the contract, instead of a value we are passing to the function
     if (ethSelected) {
      tx = await exchangeContract.ethTomyToken(
        tokenToBeReceivedAfterSwap,
        {
          value: swapAmountWei,
        }
      );
    } else {
      // User has to approve `swapAmountWei` for the contract because `nuketk` token
      // is an ERC20
      tx = await tokenContract.approve(
        EXCHANGE_CONTRACT_ADDRESS,
        swapAmountWei.toString()
      );
      await tx.wait();
      // call nuketkTokenToEth function which would take in `swapAmountWei` of `nuketk` tokens and would
      // send back `tokenToBeReceivedAfterSwap` amount of `Eth` to the user
      tx = await exchangeContract.mytokenToEth(
        swapAmountWei,
        tokenToBeReceivedAfterSwap
      );
    }
    await tx.wait(); 
  };