var DASContract = artifacts.require("./DeadAccountSwitch.sol");

module.exports = function(deployer) {
  deployer.deploy(DASContract);
};
