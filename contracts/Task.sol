// SPDX-License-Identifier: MIT

import "./TRC20.sol";
import "./SafeMath.sol";
import "./Ownable.sol";

pragma solidity ^0.5.10;

contract Task is Ownable {
    using SafeMath for uint256;

    address payable beneficiary;

    event DepositAccepted(uint256 amount);
    event ComissionSendedToBeneficiary(uint256 comission);
    event BeneficiaryChanged(
        address indexed previousBeneficiary,
        address indexed newBeneficiary
    );

    constructor(address beneficiaryAddress) public {
        beneficiary = address(uint160(beneficiaryAddress));
    }

    function changeBeneficiary(address newBeneficiary) public onlyOwner {
        require(newBeneficiary != address(0));

        emit BeneficiaryChanged(beneficiary, newBeneficiary);
        beneficiary = address(uint160(newBeneficiary));
    }

    function getTokenBalance(address target, TRC20 tokenContract)
        public
        view
        returns (uint256)
    {
        return TRC20(tokenContract).balanceOf(target);
    }

    function getBalancesByTokens(address target, TRC20[3] memory tokenContracts)
        public
        view
        returns (uint256[3] memory)
    {
        uint256[3] memory balances;

        for (uint256 i = 0; i < tokenContracts.length; i++) {
            uint256 tokenBalance = getTokenBalance(target, tokenContracts[i]);

            balances[i] = tokenBalance;
        }

        return balances;
    }

    function deposit(uint256 amount) public payable {
        uint256 fee;
        uint256 balance = address(this).balance;

        emit DepositAccepted(amount);
        balance += amount;

        if (amount <= 100) {
            fee = (amount.div(100).mul(1));
        } else if (amount > 100 && amount <= 1000) {
            fee = (amount.div(100).mul(2));
        } else {
            fee = (amount.div(100).mul(3));
        }

        emit ComissionSendedToBeneficiary(fee);
        beneficiary.transfer(fee);
    }

    // Note: Also we could use fallback fn to prevent missing funds sends to contract address
    // But transaction could be reverted, if operations inside fn would be huge

    function() external payable {
        require(msg.data.length == 0);

        // Because of gas limit for fallback fn is 2300 gas - called deposit fn could be reverted
        // deposit(msg.value);
    }
}
