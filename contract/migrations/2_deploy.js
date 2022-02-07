const CoreEvidence = artifacts.require('CoreEvidence');

module.exports = async function (deployer) {
  await deployer.deploy(CoreEvidence);
  
  const instance = await CoreEvidence.deployed();
  console.log('📦 Deployed', instance.address);
};
