// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
    address public myTokenAddress;

    constructor(address _myToken) ERC20("nukeTKLP", "LPNTK") {
        require(_myToken != address(0));
        myTokenAddress = _myToken;
    }

    function getReserve() public view returns (uint256) {
        return ERC20(myTokenAddress).balanceOf(address(this));
    }

    //Adding into liquidity Pool
    function addLiquidity(uint256 _amount) public payable returns (uint256) {
        uint256 liquidity;

        uint256 ethBal = address(this).balance;
        
        uint256 reserve = getReserve();
        
        ERC20 myToken = ERC20(myTokenAddress);
        //If the Reserve empty we don't need to maintain the liquidity 
        //If the reserve empty then the first user who are creating pool allow the intial call(set the pool)
        if (reserve == 0) {
            //Amount of ERC20 token minted is equal to eth supplied by the user
           
            myToken.transferFrom(msg.sender, address(this), _amount);
           
            liquidity = ethBal;
           
            _mint(msg.sender, liquidity);
        
        } 
        else 
        {
            //Current Account Balance, subtracting eth supplied by the user 
            uint256 ethReserve = ethBal - msg.value;
            // we maintain a ratio which has to remain constant. (x * y = k)
            //The ratio is (mytoken user can add/mytokenReserve in the contract) = (Eth Sent by the user/Eth Reserve in the contract).
            //Amount of token user can add
            uint256 myTokenCheck = (msg.value * reserve) / ethReserve;
            require(
                _amount >= myTokenCheck,
                "Entered Value is less than minimum token required"
            );
            myToken.transferFrom(msg.sender, address(this), myTokenCheck);
            liquidity = (totalSupply() * msg.value) / ethReserve;
            _mint(msg.sender, liquidity);
        }
        return liquidity;
    }

    //Removing from liquidity Pool
    //Amount Send back to user
    function removeLiquidity(uint256 _amount)
        public
        returns (uint256, uint256)
    {
        require(_amount > 0, "Amount must be greater than Zero");
        
        uint256 ethReserve = address(this).balance;
        
        uint256 _totalSupply = totalSupply();
        
        //Eth sent back to user/current Eth Reserve = Amount of Token user wants to withdraw/total supply of token
        //Eth sent back to user =  Amount of Token user wants to withdraw * Current Eth Reserve/total supply of token
        uint256 amountEth = (_amount * ethReserve) / _totalSupply;
        _burn(msg.sender, _amount);
        uint256 _myToken = (_amount * getReserve()) / _totalSupply;
        payable(msg.sender).transfer(amountEth);
        ERC20.transfer(msg.sender, _myToken);
        return (amountEth, _myToken);
    }
    
    //Swapping Function
    //Cost of swapping Tokens
    // charging a fee of `1%`
    // Input amount with fee = (input amount - (1*(input amount)/100)) = ((input amount)*99)/100
    function getAmountTokens(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) public pure returns (uint256) {
        require(inputReserve > 0 && outputReserve > 0, "Values less than zero");
        
        uint256 inputAmountFee = inputAmount * 99;
        // Because we need to follow the concept of `XY = K` curve
        // We need to make sure (x + Δx) * (y - Δy) = x * y
        // So the final formula is Δy = (y * Δx) / (x + Δx)
        // Δy in our case is `tokens to be received`
        // Δx = ((input amount)*99)/100, x = inputReserve, y = outputReserve
        uint256 numerator = inputAmountFee * outputReserve;
        uint256 denominator = (inputReserve * 100) + inputAmountFee;
        return numerator / denominator;
    }

    //From Eth to ERC20 token
    function ethTomyToken(uint256 _minTokens) public payable {
        uint256 tokenReserve = getReserve();
        uint256 tokensBought = getAmountTokens(
            msg.value,
            address(this).balance - msg.value,
            tokenReserve
        );
        require(tokensBought >= _minTokens, "insufficient output amount");
         // Transfer the `mytoken` tokens to the user
        ERC20(myTokenAddress).transfer(msg.sender, tokensBought);
    }

    //from ERC20 to eth token
    function mytokenToEth(uint256 _tokenSold, uint256 _minEth) public {
        uint256 tokenReserve = getReserve();
        uint256 ethBought = getAmountTokens(
            _tokenSold,
            tokenReserve,
            address(this).balance
        );
        require(ethBought >= _minEth, "insufficient output amount");
        ERC20(myTokenAddress).transferFrom(
            msg.sender,
            address(this),
            _tokenSold
        );
        // send the `ethBought` to the user from the contract
        payable(msg.sender).transfer(ethBought);
    }
}
