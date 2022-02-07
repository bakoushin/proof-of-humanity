const { expect } = require('chai');
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const CoreEvidence = artifacts.require('CoreEvidence');

contract('CoreEvidence / Evidence', function([ owner ]) {
  let coreEvidence;

  const delegate = {
    address: '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0',
    privateKey: '0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1'
  };
  const agent = {
    address: '0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b',
    privateKey: '0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c'
  };

  const R = web3.utils.randomHex(32);
  const agentSignature = web3.eth.accounts.sign(R, agent.privateKey).signature;
  const timestamp = web3.utils.numberToHex(new Date('1980-01-01T00:00:00.000Z').valueOf());
  const hash = web3.utils.keccak256(
    web3.utils.bytesToHex([
      ...web3.utils.hexToBytes(R),
      ...web3.utils.hexToBytes(agent.address),
      ...web3.utils.hexToBytes(timestamp),
      ...web3.utils.hexToBytes(agentSignature)
    ])
  );
  const delegateSignature = web3.eth.accounts.sign(hash, delegate.privateKey).signature;
  const evidence = web3.utils.bytesToHex([
    ...web3.utils.hexToBytes(R),
    ...web3.utils.hexToBytes(agentSignature),
    ...web3.utils.hexToBytes(delegateSignature)
  ]);

  before(async () => {
    coreEvidence = await CoreEvidence.deployed();
    await coreEvidence.addEvidenceDelegate(delegate.address, { from: owner });
  });
  
  it('can store and return an evidence', async () => {
    await coreEvidence.submitEvidence(agent.address, timestamp, delegate.address, evidence, { from: agent.address });

    const receipt = await coreEvidence.proofOfHumanity.call(agent.address);

    expect(receipt).to.include({
      agent: agent.address,
      timestamp,
      delegate: delegate.address,
      evidence
    });
  });

  it('prevents submitting a valid evidence from non-agent address', async () => {
    await expectRevert(
      coreEvidence.submitEvidence(agent.address, timestamp, delegate.address, evidence, { from: delegate.address }),
      "Agent must sumbit evidence itself",
    );
  });  

  it('prevents submitting a valid evidence with unregistered delegate', async () => {
    await expectRevert(
      coreEvidence.submitEvidence(agent.address, timestamp, agent.address, evidence, { from: agent.address }),
      "Submitted delegate is not registered in core contract",
    );
  });  

  it('can validate an evidence', async () => {
    const result = await coreEvidence.validateEvidence.call(agent.address, timestamp, delegate.address, evidence);
    expect(result).to.be.true;
  });

  it('do not validate evidence with incorrect delegate address', async () => {
    const result = await coreEvidence.validateEvidence.call(agent.address, timestamp, agent.address, evidence);
    expect(result).to.be.false;
  });  

  it('do not validate evidence with incorrect agent address', async () => {
    const result = await coreEvidence.validateEvidence.call(delegate.address, timestamp, delegate.address, evidence);
    expect(result).to.be.false;
  });  

  it('reverts in case of validating random bytes as evidence', async () => {
    await expectRevert.unspecified(
      coreEvidence.validateEvidence.call(delegate.address, timestamp, delegate.address, web3.utils.randomHex(162))
    );
  });  

  it('emits "EvidenceSubmitted" event with agent address', async () => {
    const receipt = await coreEvidence.submitEvidence(agent.address, timestamp, delegate.address, evidence, { from: agent.address });
    expectEvent(receipt, 'EvidenceSubmitted', { agent: agent.address });
  });

  it('correctly splits evidence', async () => {
    const evidenceBytes = web3.utils.hexToBytes(evidence);
    const R = web3.utils.bytesToHex(evidenceBytes.slice(0, 32));
    const agentSignature = web3.utils.bytesToHex(evidenceBytes.slice(32, 97));
    const delegateSignature = web3.utils.bytesToHex(evidenceBytes.slice(97));
    
    const result = await coreEvidence.splitEvidence.call(evidence);
    expect(result).to.include({ R, agentSignature, delegateSignature });
  });

});