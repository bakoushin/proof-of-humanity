const CoreEvidence = artifacts.require('CoreEvidence');

module.exports = async function (deployer) {
  await deployer.deploy(CoreEvidence);
};
