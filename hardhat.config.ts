import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
    solidity: "0.5.10",
    etherscan: {
        apiKey: "",
    },
};

export default config;
