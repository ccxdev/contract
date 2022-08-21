// SPDX-License-Identifier: MIT

import "./IERC20.sol";
import "./SafeMath.sol";
import "./Ownable.sol";

pragma solidity ^0.5.10;

contract Task is Ownable {
    using SafeMath for uint256;

    address payable public beneficiary;

    event DepositAccepted(uint256 amount);
    event ComissionSendedToBeneficiary(uint256 comission);
    event BeneficiaryChanged(
        address indexed previousBeneficiary,
        address indexed newBeneficiary
    );

    constructor(address payable beneficiaryAddress) public payable {
        beneficiary = beneficiaryAddress;
    }

    function changeBeneficiary(address payable newBeneficiary)
        public
        onlyOwner
    {
        require(newBeneficiary != address(0));

        emit BeneficiaryChanged(beneficiary, newBeneficiary);
        beneficiary = newBeneficiary;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getTokenBalance(address account, address _token)
        public
        view
        returns (uint)
    {
        IERC20 token = IERC20(address(_token));

        return token.balanceOf(account);
    }

    function getBalancesByTokens(address account, address[3] memory _tokens)
        public
        view
        returns (uint256[3] memory)
    {
        uint256[3] memory balances;

        for (uint256 i = 0; i < _tokens.length; i++) {
            uint256 tokenBalance = getTokenBalance(account, _tokens[i]);

            balances[i] = tokenBalance;
        }

        return balances;
    }

    function deposit(uint256 amount) public payable {
        uint basisFee;

        if (amount <= 100) {
            basisFee = 1;
        } else if (amount > 100 && amount <= 1000) {
            basisFee = 2;
        } else {
            basisFee = 3;
        }

        uint fee = (amount.mul(basisFee)).div(100);
        uint sendAmount = amount.sub(fee);

        uint balance = address(this).balance;
        balance += sendAmount;
        emit DepositAccepted(sendAmount);

        beneficiary.transfer(fee);
        emit ComissionSendedToBeneficiary(fee);
    }

    // Note: Also we could use fallback fn to prevent missing funds sends to contract address
    // But transaction could be reverted, if operations inside fn would be huge

    function() external payable {}
}
