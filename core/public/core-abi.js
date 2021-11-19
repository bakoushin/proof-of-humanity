'use strict';

export default [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'evidenceDelegate',
        type: 'address'
      }
    ],
    name: 'EvidenceDelegateAdded',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'agent',
        type: 'address'
      }
    ],
    name: 'EvidenceSubmitted',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address'
      }
    ],
    name: 'OwnershipTransferred',
    type: 'event'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    name: 'isDelegate',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    name: 'proofOfHumanity',
    outputs: [
      {
        internalType: 'address',
        name: 'agent',
        type: 'address'
      },
      {
        internalType: 'bytes',
        name: 'timestamp',
        type: 'bytes'
      },
      {
        internalType: 'address',
        name: 'delegate',
        type: 'address'
      },
      {
        internalType: 'bytes',
        name: 'evidence',
        type: 'bytes'
      }
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address'
      }
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'delegate',
        type: 'address'
      }
    ],
    name: 'addEvidenceDelegate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'agent',
        type: 'address'
      },
      {
        internalType: 'bytes',
        name: 'timestamp',
        type: 'bytes'
      },
      {
        internalType: 'address',
        name: 'delegate',
        type: 'address'
      },
      {
        internalType: 'bytes',
        name: 'evidence',
        type: 'bytes'
      }
    ],
    name: 'submitEvidence',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'evidence',
        type: 'bytes'
      }
    ],
    name: 'splitEvidence',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'R',
        type: 'bytes32'
      },
      {
        internalType: 'bytes',
        name: 'agentSignature',
        type: 'bytes'
      },
      {
        internalType: 'bytes',
        name: 'delegateSignature',
        type: 'bytes'
      }
    ],
    stateMutability: 'pure',
    type: 'function',
    constant: true
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'agent',
        type: 'address'
      },
      {
        internalType: 'bytes',
        name: 'timestamp',
        type: 'bytes'
      },
      {
        internalType: 'address',
        name: 'delegate',
        type: 'address'
      },
      {
        internalType: 'bytes',
        name: 'evidence',
        type: 'bytes'
      }
    ],
    name: 'validateEvidence',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'pure',
    type: 'function',
    constant: true
  }
];
