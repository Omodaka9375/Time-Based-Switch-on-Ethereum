var TBSContract = artifacts.require("./TimeBasedSwitch.sol");

const keeperRegistry = `0xAaaD7966EBE0663b8C9C6f683FB9c3e66E03467F`;

module.exports = function(deployer) {
  deployer.deploy(TBSContract, keeperRegistry);
};
