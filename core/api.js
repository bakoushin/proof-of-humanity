import express from 'express';
import ethers from 'ethers';
import { jsonRPC, coreAddress } from './config.js';
import coreABI from './core-abi.js';

const provider = new ethers.providers.JsonRpcProvider(jsonRPC);
const coreContract = new ethers.Contract(coreAddress, coreABI, provider);

const api = express.Router();

const methodNotAllowed = (req, res) => {
  res.sendStatus(405);
};

api
  .route('/verify/:address')
  .get(async (req, res, next) => {
    try {
      const { address } = req.params;

      const { agent, delegate, evidence, timestamp } =
        await coreContract.proofOfHumanity(address);

      console.log({ agent, delegate, evidence, timestamp });

      // Check wether the evidence is empty.
      if (!ethers.utils.hexDataLength(evidence)) {
        res.json({
          result: false,
          timestamp: null
        });
        return;
      }

      const isAddressValid = address.toLowerCase() === agent.toLowerCase();

      const R = ethers.utils.hexDataSlice(evidence, 0, 32);
      const agentSignature = ethers.utils.hexDataSlice(evidence, 32, 97);
      const delegateSignature = ethers.utils.hexDataSlice(evidence, 97);

      const verifiedAgent = ethers.utils.verifyMessage(
        ethers.utils.arrayify(R),
        agentSignature
      );
      const isAgentValid = verifiedAgent.toLowerCase() === agent.toLowerCase();

      const hash = ethers.utils.keccak256(
        ethers.utils.hexConcat([R, agent, timestamp, agentSignature])
      );

      const verifiedDelegate = ethers.utils.verifyMessage(
        ethers.utils.arrayify(hash),
        delegateSignature
      );

      const isDelegateValid =
        verifiedDelegate.toLowerCase() === delegate.toLowerCase();

      const result = isAddressValid && isAgentValid && isDelegateValid;

      res.json({
        result,
        timestamp: result
          ? new Date(parseInt(timestamp, 16)).toISOString()
          : null
      });
    } catch (error) {
      next(error);
    }
  })
  .all(methodNotAllowed);

export default api;
