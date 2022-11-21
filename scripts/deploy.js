
const main = async () => {
    const contractMyToken = await ethers.getContractFactory("MyToken");
    const deployToken =await contractMyToken.deploy();
    await deployToken.deployed();
    console.log("Token Address:", deployToken.address);
    const _getSigner = await ethers.getSigner();
    await deployToken.mint(_getSigner.address, 10000);
    const contractExchange = await ethers.getContractFactory("Exchange");
    const deployExchange = await contractExchange.deploy(deployToken.address);
    await deployExchange.deployed();
    console.log("Exchange Address:", deployExchange.address);
  };
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
  