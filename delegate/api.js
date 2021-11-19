import express from 'express';
import ethers from 'ethers';
import hcaptcha from 'hcaptcha';
import { delegateKey, hcaptchaSecret } from './config.js';

const wallet = new ethers.Wallet(delegateKey);

const api = express.Router();

const methodNotAllowed = (req, res) => {
  res.sendStatus(405);
};

api
  .route('/evidence')
  .post(async (req, res, next) => {
    try {
      const { address, R, signature, token } = req.body;

      const verifiedAddress = ethers.utils.verifyMessage(
        ethers.utils.arrayify(R),
        signature
      );
      if (verifiedAddress.toLowerCase() !== address.toLowerCase()) {
        res.sendStatus(400);
        return;
      }

      const result = await hcaptcha.verify(hcaptchaSecret, token);
      const { success, challenge_ts } = result;
      if (!success) {
        res.sendStatus(400);
        return;
      }

      const timestamp = ethers.utils.hexlify(new Date(challenge_ts).valueOf());

      // Must be:
      // ECDSA_SIG(R | address | timestamp | ECDSA_SIG(R, address), delegate-address)
      const hash = ethers.utils.keccak256(
        ethers.utils.hexConcat([R, address, timestamp, signature])
      );
      const delegateSignature = await wallet.signMessage(
        ethers.utils.arrayify(hash)
      );

      // Must be:
      // R | ECDSA_SIG(R, address) | ECDSA_SIG(R | address | timestamp | ECDSA_SIG(R, address), delegate-address)
      const evidence = ethers.utils.hexConcat([
        R,
        signature,
        delegateSignature
      ]);

      res.json({ timestamp, evidence });
    } catch (error) {
      next(error);
    }
  })
  .all(methodNotAllowed);

export default api;
