// SPDX-License-Identifier: MIT

pragma solidity ^0.5.10;

library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
        c = a + b;
        require(c >= a, "Overflow.");
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256 c) {
        require(b <= a, "Overflow.");
        c = a - b;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
        c = a * b;
        require(a == 0 || c / a == b, "Overflow.");
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256 c) {
        require(b != 0, "Division by zero.");
        c = a / b;
    }

    function mod(uint256 a, uint256 b) internal pure returns (uint256 c) {
        require(b != 0, "Division by zero.");
        c = a % b;
    }
}
