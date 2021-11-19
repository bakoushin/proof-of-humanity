// SPDX-License-Identifier: MIT
pragma solidity >=0.8.5 <0.9.0;

import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract CoreEvidence is Ownable {
  using ECDSA for bytes32;

  event EvidenceDelegateAdded(address indexed evidenceDelegate);
  event EvidenceSubmitted(address indexed agent);

  /**
   * Addresses approved as delegates by contract owner.
   */
  mapping(address => bool) public isDelegate;

  /**
   * Core struct storing the Proof-of-Humanity.
   * 
   * `evidence` is constructed as follows:
   * 32 bytes: R (random data hash)
   * 65 bytes: agent address ownership proof (ECDSA_SIG(R, address))
   * 65 bytes: evidence data proof (ECDSA_SIG(R, delegate))
   * 
   * Delegate signed evidence data is constructed as concatenation:
   * R | address | timestamp | ECDSA_SIG(R, address)
   */
  struct ProofOfHumanity {
    address agent;
    bytes timestamp;
    address delegate;
    bytes evidence;
  }

  /**
   * Proofs-of-Humanity by address.
   * Should be used to verify if an address has any proof submitted.
   */
  mapping(address => ProofOfHumanity) public proofOfHumanity;

  /**
   * Adds new evidence delegate address to `isDelegate` mapping.
   */
  function addEvidenceDelegate(address delegate) public onlyOwner {
    isDelegate[delegate] = true;
    emit EvidenceDelegateAdded(delegate);
  }

  /**
   * Adds new Proof-of-Humanity to `proofOfHumanity` mapping for provided `agent` address.
   */
  function submitEvidence(
    address agent,
    bytes memory timestamp,
    address delegate,
    bytes memory evidence
  ) public {
    require(isDelegate[delegate], 'Submitted delegate is not registered in core contract');
    proofOfHumanity[agent] = ProofOfHumanity(agent, timestamp, delegate, evidence);
    emit EvidenceSubmitted(agent);
  }

  /**
   * Splits evidence data to 3 parts:
   * 32 bytes - random data hash
   * 65 bytes - agent address ownership proof (agent signature on aforementioned random data hash)
   * 65 bytes - evidence data proof (delegate signature on evidence data)
   */
  function splitEvidence(bytes calldata evidence) public pure returns (
    bytes32 R,
    bytes memory agentSignature,
    bytes memory delegateSignature
  ) {
    R = bytes32(evidence[:32]);
    agentSignature = evidence[32:97];
    delegateSignature = evidence[97:];
    return (R, agentSignature, delegateSignature);
  }

  /**
   * Validates evidence by checking validity of agent and delegate signatures.
   * Returns: (bool) wether evidence is valid.
   */
  function validateEvidence(
    address agent, 
    bytes memory timestamp,
    address delegate,
    bytes calldata evidence
  ) public pure returns (bool) {
    (bytes32 R, bytes memory agentSignature, bytes memory delegateSignature) = splitEvidence(evidence);
    
    address validatedAgent = R
      .toEthSignedMessageHash()
      .recover(agentSignature);
    
    address validatedDelegate = keccak256(abi.encodePacked(R, agent, timestamp, agentSignature))
      .toEthSignedMessageHash()
      .recover(delegateSignature);
      
    return agent == validatedAgent && delegate == validatedDelegate;
  }
}
