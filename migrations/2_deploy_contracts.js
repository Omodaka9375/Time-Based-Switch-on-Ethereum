var TBSContract = artifacts.require("./TimeBasedSwitch.sol");

module.exports = function(deployer) {
  deployer.deploy(TBSContract);
};
