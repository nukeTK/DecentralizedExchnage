import { Contract} from "ethers";
import EXCHANGE_CONTRACT_ABI from "../artifacts/contracts/Exchange.sol/Exchange.json";

const EXCHANGE_CONTRACT_ADDRESS = "0x005fC6a9bC16031A0864d9a48925Dc0eA30f1A39";



/**
 * removeLiquidity: Removes the `removeNTKLPTokensWei` amount of LP tokens from
 * liquidity and also the calculated amount of `ether` and `CD` tokens
 */
export const removeLiquidity = async (signer, removeLPTokensWei) => {
  // Create a new instance of the exchange contract
  const exchangeContract = new Contract(
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI.abi,
    signer
  );
  const tx = await exchangeContract.removeLiquidity(removeLPTokensWei);
  await tx.wait();
};

/**
 * getTokensAfterRemove: Calculates the amount of `Eth` and `NTK` tokens
 * that would be returned back to user after he removes `removeNTKLPTokenWei` amount
 * of LP tokens from the contract
 */
export const getTokensAfterRemove = async (
  provider,
  removeNTKLPTokenWei,
  _ethBalance,
  nukeTKLPTOkens
) => {
  try {
    // Create a new instance of the exchange contract
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI.abi,
      provider
    );
    // Get the total supply of `Crypto Dev` LP tokens
    const _totalSupply = await exchangeContract.totalSupply();
    // Here we are using the BigNumber methods of multiplication and division
    // The amount of Eth that would be sent back to the user after he withdraws the LP token
    // is calculated based on a ratio,
    // Ratio is -> (amount of Eth that would be sent back to the user / Eth reserve) = (LP tokens withdrawn) / (total supply of LP tokens)
    // By some maths we get -> (amount of Eth that would be sent back to the user) = (Eth Reserve * LP tokens withdrawn) / (total supply of LP tokens)
    // Similarly we also maintain a ratio for the `CD` tokens, so here in our case
    // Ratio is -> (amount of CD tokens sent back to the user / CD Token reserve) = (LP tokens withdrawn) / (total supply of LP tokens)
    // Then (amount of CD tokens sent back to the user) = (CD token reserve * LP tokens withdrawn) / (total supply of LP tokens)
    const _removeEther = _ethBalance.mul(removeNTKLPTokenWei).div(_totalSupply);
    const _removeNTK = nukeTKLPTOkens
      .mul(removeNTKLPTokenWei)
      .div(_totalSupply);
    return {
      _removeEther,
      _removeNTK,
    };
  } catch (err) {
    console.error(err);
  }
};