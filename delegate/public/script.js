'use strict';

import coreABI from './core-abi.js';

document.addEventListener('DOMContentLoaded', () => {
  const connectWallet = document.getElementById('connect-wallet');
  const connectWalletButton = document.getElementById('connect-wallet-button');
  const walletAddress = document.getElementById('wallet-address');

  const main = document.getElementById('main');

  const confirmOwnershipButton = document.getElementById(
    'confirm-ownership-button'
  );
  const ownershipConfirmation = document.getElementById(
    'ownership-confirmation'
  );
  const ownershipConfirmationSuccess = document.getElementById(
    'ownership-confirmation-success'
  );

  const form = document.getElementById('form');
  const submission = document.getElementById('submission');
  const submissionError = document.getElementById('submission-error');
  const submissionSuccess = document.getElementById('submission-success');
  const submissionTime = document.getElementById('submission-time');

  const delegateAddress = document
    .getElementById('delegate-address')
    .textContent.trim();
  const coreAddress = document
    .getElementById('core-address')
    .textContent.trim();

  let coreContract;
  let address;
  let R;
  let signature;

  connectWalletButton.addEventListener('click', async () => {
    try {
      await ethereum.request({ method: 'eth_requestAccounts' });
      window.web3 = new Web3(window.ethereum);

      const accounts = await web3.eth.getAccounts();
      address = accounts[0];

      coreContract = new web3.eth.Contract(coreABI, coreAddress);

      walletAddress.textContent = address;
      connectWallet.classList.add('hidden');
      main.classList.remove('hidden');
    } catch (error) {
      console.error(error);
    }
  });

  confirmOwnershipButton.addEventListener('click', async () => {
    try {
      R = web3.utils.keccak256(Math.random().toString());
      signature = await web3.eth.personal.sign(R, address);

      ownershipConfirmation.classList.add('hidden');
      ownershipConfirmationSuccess.classList.remove('hidden');
    } catch (error) {
      console.error(error);
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const token = formData.get('h-captcha-response');

    if (!signature || !token) {
      submissionError.textContent = 'Please complete all confirmations';
      return;
    }
    submissionError.textContent = null;

    try {
      const result = await fetch('/api/v1/evidence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address, R, signature, token })
      });

      if (!result.ok) {
        if (result.status === 400) {
          submissionError.textContent = 'Evidence validation failed';
        } else {
          submissionError.textContent = 'Server error';
        }
        throw new Error(await result.text());
      }

      const { timestamp, evidence } = await result.json();

      const evidenceTime = new Date(parseInt(timestamp, 16)).toISOString();

      coreContract.once(
        'EvidenceSubmitted',
        { filter: { agent: address } },
        (error, event) => {
          if (error) {
            console.error(error);
            return;
          }

          const agent = event?.returnValues?.agent;
          if (agent !== address) {
            return;
          }

          submission.classList.add('hidden');
          submissionTime.textContent = evidenceTime;
          submissionSuccess.classList.remove('hidden');
        }
      );

      await coreContract.methods
        .submitEvidence(address, timestamp, delegateAddress, evidence)
        .send({ from: address });
    } catch (error) {
      console.error(error);
    }
  });
});
