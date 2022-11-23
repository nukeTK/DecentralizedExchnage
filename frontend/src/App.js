import React, { useState } from "react";
import tokenabi from "./artifacts/contracts/MyToken.sol/MyToken.json";
import exchnageabi from "./artifacts/contracts/Exchange.sol/Exchange.json";
import Button from "@mui/material/Button";
import { Box } from "@mui/system";
import HomePage from "./components/HomePage";
import { Stack, Typography } from "@mui/material";

const { ethers } = require("ethers");
const tokenAddress = "0x83847879B0142E2354946d4f2553A569897AaCe2";
const exchangeAddress = "0x005fC6a9bC16031A0864d9a48925Dc0eA30f1A39";

const App = () => {
  const [web3, setWeb3] = useState({
    provider: "",
    token: "",
    exchnage: "",
  });
  const [userAddress, setUserAdd] = useState("");

  const connectToWallet = async () => {
    const _provider = new ethers.providers.Web3Provider(window.ethereum);

    if (_provider) {
      await _provider.send("eth_requestAccounts", []);
      const signer = _provider.getSigner();

      const address = await signer.getAddress();

      const contract1 = new ethers.Contract(
        tokenAddress,
        tokenabi.abi,
        _provider
      );
      const contract2 = new ethers.Contract(
        exchangeAddress,
        exchnageabi.abi,
        _provider
      );
      setWeb3({
        provider: _provider,
        token: contract1,
        exchnage: contract2,
      });
      setUserAdd(address);
    }
  };
  return (
    <Box sx={{ backgroundColor: "darkgrey", height: "100vh" }}>
      <Stack gap={2} sx={{ textAlign: "center", alignItems: "center" }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: ".1rem",
            color:"darkcyan"
          }}
        >
          CRYPTO EXCHANGE
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: ".1rem",
          }}
        >
          Exchange GoerliEth = ERC20 NTK TOKENs
        </Typography>
        <Button
          variant="contained"
          onClick={() => connectToWallet()}
          sx={{ width: "20%" }}
        >
          {userAddress ? userAddress : "Connect To wallet"}
        </Button>
        {userAddress && <HomePage web3={web3} userAddress={userAddress} />}
      </Stack>
    </Box>
  );
};

export default App;
