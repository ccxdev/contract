# Test task

Requirements:
- solidity version **0.5.10 (Tron Network)**
- unit tests

### Fee groups
3 main groups of commissions, differing in the amount of the transaction. Commission trading operations must be transferred to the address that will be specified in the contract

Transaction amount Fee, %

- <= 100 1
- \> 100 AND <= 1000 2
- \> 1000 3

Description:
*Depending on the amount of token A, a commission should be applied, the commission
should be sent to the address that will have to be determined in the contract, and if
necessary, replace it with another one.*

### User Balances
There must be a method getBalances, available to any user on the network, which will take 2
parameters - (address, and an array of tokens -  `[token0,token1,token3]`) in the format
the result of the function should give the user the balances of all the tokens that he provided:

**Example:**
```
“0”:113355677,
“1”:112467777,
“2”:112355678
```

### Getting started

```bash
mkdir ~/Desktop/contract && cd ~/Desktop/contract && git clone https://github.com/ccxdev/contract.git .
```

```bash
npm i
```

```bash
npx harhat test tests/Test.test.ts
```
