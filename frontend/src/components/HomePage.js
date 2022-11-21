import React, { useEffect, useState } from "react";
import { Box } from "@mui/system";
import {
  Button,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  getEtherBalance,
  getNTKLPTokensBalance,
  getNTKTokensBalance,
  getReserveOfNTKTokens,
} from "./getAmount";
import { BigNumber, ethers } from "ethers";
import { getAmountOfTokensReceivedFromSwap,swapTokens } from "./swap";
import { addLiquidity, calculateNTK } from "./addLiquidity";
import { getTokensAfterRemove, removeLiquidity } from "./removeLiquidity";

const HomePage = (props) => {
  // We have two tabs in this dapp, Liquidity Tab and Swap Tab.
  const [liquidityTab, setLiquidityTab] = useState(true);
  //Eth held by the Users
  const [ethBalance, setEtherBalance] = useState(0);
  // `reservedNTKLP` keeps track of the nuketk LP tokens Reserve balance in the Exchange contract
  const [reservedNTK, setReservedNTK] = useState(0);
  // Keeps track of the ether balance in the contract
  const [etherBalanceContract, setEtherBalanceContract] = useState("");
  // NTKBalance is the amount of `NTK` tokens held by the users account
  const [ntkBalance, setNTKBalance] = useState(0);
  // `lpBalance` is the amount of NTKLP tokens held by the users account
  const [ntklpBalance, setNTKLPBalance] = useState(0);
  /** Variables to keep track of liquidity to be added or removed */
  // addEther is the amount of Ether that the user wants to add to the liquidity
  const [addEther, setAddEther] = useState(0);
  // addNTKTokens keeps track of the amount of NTK tokens that the user wants to add to the liquidity
  // in case when there is no initial liquidity and after liquidity gets added it keeps track of the
  // NTK tokens that the user can add given a certain amount of ether
  const [addNTKTokens, setAddNTKTokens] = useState(0);
  // removeEther is the amount of `Ether` that would be sent back to the user based on a certain number of `NTKLP` tokens
  const [removeEther, setRemoveEther] = useState(0);
  // removeNTK is the amount of `nuketTK` tokens that would be sent back to the user based on a certain number of `NUKETKLP` tokens
  // that he wants to withdraw
  const [removeNTK, setRemoveNTK] = useState(0);
  // amount of NTKLP tokens that the user wants to remove from liquidity
  const [removeNTKLPTokens, setRemoveNTKLPTokens] = useState(0);
  /** Variables to keep track of swap functionality */
  // Amount that the user wants to swap
  const [swapAmount, setSwapAmount] = useState(0);
  // This keeps track of the number of tokens that the user would receive after a swap completes
  const [tokenToBeReceivedAfterSwap, settokenToBeReceivedAfterSwap] =
    useState(0);
  // Keeps track of whether  `Eth` or `nuketk` token is selected. If `Eth` is selected it means that the user
  // wants to swap some `Eth` for some `nuketk` tokens and vice versa if `Eth` is not selected
  const [ethSelected, setEthSelected] = useState(true);

  //call all the function to retrive the values
  const getAmounts = async () => {
    try {
      const _ethBalance = await getEtherBalance(
        props.web3.provider,
        props.userAddress
      );
      const _ntkBalance = await getNTKTokensBalance(
        props.web3.provider,
        props.userAddress
      );
      const _ntkLPBalance = await getNTKLPTokensBalance(
        props.web3.provider,
        props.userAddress
      );
      const _reserveNTKLPTokens = await getReserveOfNTKTokens(
        props.web3.provider
      );
      const _ethContractBal = await getEtherBalance(
        props.web3.provider,
        null,
        true
      );
      setEtherBalance(_ethBalance.toString());
      setNTKBalance(_ntkBalance.toString());
      setNTKLPBalance(_ntkLPBalance.toString());
      setReservedNTK(_reserveNTKLPTokens.toString());
      setEtherBalanceContract(_ethContractBal.toString());
    } catch (error) {
      console.error(error);
    }
  };
  console.log(swapAmount)
  /**** SWAP FUNCTIONS ****/
  const swap = async () => {
      
      const swapAmountWei = ethers.utils.parseEther(swapAmount);
      if (!swapAmountWei.eq(0)) {
        const signer = props.web3.provider.getSigner();
        await swapTokens(
          signer,
          swapAmountWei,
          tokenToBeReceivedAfterSwap,
          ethSelected
        );

        await getAmounts();
        setSwapAmount("");
      }
    
  };
  const _getAmountOfTokensReceivedFromSwap = async () => {
    try {
      // Convert the amount entered by the user to a BigNumber using the `parseEther` library from `ethers.js`
      const _swapAmountWEI = ethers.utils.parseEther(swapAmount.toString());

      // Check if the user entered zero
      // We are here using the `eq` method from BigNumber class in `ethers.js`
      if (!_swapAmountWEI.eq(0)) {
        //const signer = await props.web3.provider.getSigner();
        // Get the amount of ether in the contract
        const _ethBalance = await getEtherBalance(
          props.web3.provider,
          null,
          true
        );
        // Call the `getAmountOfTokensReceivedFromSwap` from the utils folder
        const amountOfTokens = await getAmountOfTokensReceivedFromSwap(
          _swapAmountWEI,
          props.web3.provider,
          ethSelected,
          _ethBalance,
          reservedNTK
        );
        settokenToBeReceivedAfterSwap(amountOfTokens);
      } else {
        settokenToBeReceivedAfterSwap(0);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const _addLiquidity = async () => {
    try {
      const addEtherWei = ethers.utils.parseEther(addEther.toString());
      if (addNTKTokens !== 0 && addEtherWei !== 0) {
        const signer = await props.web3.provider.getSigner();

        await addLiquidity(signer, addNTKTokens, addEtherWei);
        setAddNTKTokens(0);
        await getAmounts();
      } else {
        setAddNTKTokens(0);
      }
    } catch (err) {
      console.error(err);
      setAddNTKTokens(0);
    }
  };

  const _removeLiquidity = async () => {
    try {
      const signer = await props.web3.provider.getSigner();
      const removeNTKLPTokensWei = ethers.utils.parseEther(removeNTKLPTokens);

      await removeLiquidity(signer, removeNTKLPTokensWei);
      await getAmounts();
      setRemoveNTK(0);
      setRemoveEther(0);
    } catch (err) {
      console.error(err);
      setRemoveNTK(0);
      setRemoveEther(0);
    }
  };

  const _getTokensAfterRemove = async (_removeLPTokens) => {
    try {
      const removeNTKLPTokenWei = ethers.utils.parseEther(_removeLPTokens);
      // Get the Eth reserves within the exchange contract
      const _ethBalance = await getEtherBalance(
        props.web3.provider,
        null,
        true
      );
      // get the crypto dev token reserves from the contract
      const ntkTokenReserve = await getReserveOfNTKTokens(props.web3.provider);
      // call the getTokensAfterRemove from the utils folder
      const { _removeEther, _removeNTK } = await getTokensAfterRemove(
        props.web3.provider,
        removeNTKLPTokenWei,
        _ethBalance,
        ntkTokenReserve
      );
      setRemoveEther(_removeEther);
      setRemoveNTK(_removeNTK);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    props.userAddress && getAmounts();
    swapAmount && _getAmountOfTokensReceivedFromSwap();
  }, [props.userAddress, swapAmount]);

  return (
    <Box>
      <Stack gap={2}>
        <Paper elevation={10} sx={{ padding: "20px", borderRadius: "20px" }}>
          <Typography
            variant="body1"
            sx={{
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".1rem",
            }}
          >
            User Account
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".1rem",
            }}
          >
            {ethers.utils.formatEther(ntklpBalance)} NUKETK LP TOKENS
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".1rem",
            }}
          >
            {ethers.utils.formatEther(ntkBalance)} NUKETK TOKENS
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".1rem",
            }}
          >
            {ethers.utils.formatEther(ethBalance)} ETHERS
          </Typography>
          <Stack gap={1} direction="row" sx={{ justifyContent: "center" }}>
            <Button variant="contained" onClick={() => setLiquidityTab(true)}>
              Liquidity
            </Button>
            <Button variant="contained" onClick={() => setLiquidityTab(false)}>
              Swap
            </Button>
          </Stack>
        </Paper>
        <Paper
          elevation={10}
          sx={{ width: "400px", padding: "20px", borderRadius: "10px" }}
        >
          <Stack gap={2}>
            {liquidityTab ? (
              <>
                {ethers.utils.parseEther(reservedNTK.toString()).eq(0) ? (
                  <>
                    <TextField
                      label="Enter the Amount of Ethers"
                      id="outlined-size-small"
                      size="small"
                      onChange={(e) => setAddEther(e.target.value)}
                      value={addEther}
                    />
                    <TextField
                      type="number"
                      label="Amount of NTK tokens"
                      size="small"
                      onChange={(e) =>
                        setAddNTKTokens(
                          BigNumber.from(
                            ethers.utils.parseEther(e.target.value || "0")
                          )
                        )
                      }
                      value={addNTKTokens}
                    />
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => _addLiquidity()}
                    >
                      Add Liquidity
                    </Button>
                  </>
                ) : (
                  <>
                    <TextField
                      label="Enter the Amount of Ethers"
                      id="outlined-size-small"
                      size="small"
                      onChange={async (e) => {
                        setAddEther(e.target.value);
                        const _addNTKTokens = await calculateNTK(
                          e.target.value || "0",
                          etherBalanceContract,
                          reservedNTK
                        );
                        setAddNTKTokens(_addNTKTokens);
                      }}
                      value={addEther}
                    />
                    <Typography
                      sx={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        letterSpacing: ".1rem",
                      }}
                    >
                      YOU WILL GET ${ethers.utils.formatEther(addNTKTokens)} NTK
                      TOKENS
                    </Typography>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => _addLiquidity()}
                    >
                      Add Liquidity
                    </Button>
                  </>
                )}
                <TextField
                  label="Enter the Amount of NTKLP Tokens"
                  id="outlined-size-small"
                  size="small"
                  onChange={async (e) => {
                    setRemoveNTKLPTokens(e.target.value || "0");
                    // Calculate the amount of Ether and CD tokens that the user would receive
                    // After he removes `e.target.value` amount of `LP` tokens
                    await _getTokensAfterRemove(e.target.value || "0");
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    letterSpacing: ".1rem",
                  }}
                >
                  {`You will get ${ethers.utils.formatEther(removeNTK)} NTK
                    Tokens and ${ethers.utils.formatEther(removeEther)} Eth`}
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => _removeLiquidity()}
                >
                  remove Liquidity
                </Button>
              </>
            ) : (
              <>
                <InputLabel>Select Token</InputLabel>
                <Select
                  value={ethSelected}
                  onChange={async () => {
                    setEthSelected(!ethSelected);
                    setSwapAmount("");
                  }}
                  autoWidth
                  label="Age"
                >
                  <MenuItem value={true}>Ethereum</MenuItem>
                  <MenuItem value={false}>NTK</MenuItem>
                </Select>
                <TextField
                  label="Enter the Amount"
                  id="outlined-size-small"
                  size="small"
                  type="number"
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value || "")}
                />
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    letterSpacing: ".1rem",
                  }}
                >
                  {ethSelected
                    ? `YOU WILL GET ${ethers.utils.formatEther(tokenToBeReceivedAfterSwap)} NTK TOKENS`
                    : `YOU WILL GET ${ethers.utils.formatEther(tokenToBeReceivedAfterSwap)} ETHERS`}
                </Typography>
                <Button variant="contained" onClick={() => swap()}>
                  swap
                </Button>
              </>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default HomePage;
