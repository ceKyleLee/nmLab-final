const AgencyApp = artifacts.require("AgencyApp");

module.exports = function(deployer) {
  deployer.deploy(AgencyApp);
};
