//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;


contract Randomiser {
    uint256 balance;
    uint256 betAmount;
    uint256 randomNumber;
    uint256 winnings;
    uint256 rand;    


    constructor() {
      balance = 100;
      randomNumber = 35;

 }


    function betHigh(uint256 amount) public {
        betAmount = amount;
        rand = uint256(keccak256(abi.encodePacked(block.timestamp)));
        randomNumber = (rand % 100) + 1;
        if (randomNumber > 50) {
           winnings = betAmount;  
           balance = balance + winnings;
        }
        else {
            balance = balance - betAmount;
        }
    }

    function betLow(uint256 amount) public {
        betAmount = amount;
        rand = uint256(keccak256(abi.encodePacked(block.timestamp)));
        randomNumber = (rand % 100) + 1;
        if (randomNumber < 51) {
           winnings = betAmount;  
           balance = balance + winnings;
        }
        else {
            balance = balance - betAmount;
        }
    }
    function getBalance() public view returns (uint256) {
        return balance;
    }

    function getRandomNumber() public view returns (uint256) {
        return randomNumber;
    }

    function resetBalance() public {
        balance = 100;
    }
}


