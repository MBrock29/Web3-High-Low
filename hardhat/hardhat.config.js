require("@nomiclabs/hardhat-waffle");
require("dotenv").config({ path: ".env" });

const ALCHEMY_API_KEY_URL = process.env.ALCHEMY_API_KEY_URL;

const ropsten_PRIVATE_KEY = process.env.ropsten_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat: {},
    ropsten: {
      url: ALCHEMY_API_KEY_URL,
      accounts: [ropsten_PRIVATE_KEY],
    },
  },
};
