const { expect } = require('chai');
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const CoreEvidence = artifacts.require('CoreEvidence');

contract('CoreEvidence / Delegates', (accounts) => {
  const [ owner, validDelegate, invalidDelegate, eventDelegate ] = accounts;

  let coreEvidence;

  before(async () => {
    coreEvidence = await CoreEvidence.deployed();
  });

  it('can store and confirm a delegate', async () => {
    await coreEvidence.addEvidenceDelegate(validDelegate, { from: owner });
    expect(await coreEvidence.isDelegate.call(validDelegate)).to.be.true;
  });

  it('do not confirm delegate which is not stored', async () => {
    expect(await coreEvidence.isDelegate.call(invalidDelegate)).to.be.false;
  });

  it('prevents non-owner to store a delegate', async () => {
    await expectRevert(
      coreEvidence.addEvidenceDelegate(invalidDelegate, { from: invalidDelegate }),
      'Ownable: caller is not the owner',
    );
  });

  it('emits "EvidenceDelegateAdded" event with delegate address', async () => {
    const receipt = await coreEvidence.addEvidenceDelegate(eventDelegate, { from: owner });
    expectEvent(receipt, 'EvidenceDelegateAdded', { evidenceDelegate: eventDelegate });
  });
});