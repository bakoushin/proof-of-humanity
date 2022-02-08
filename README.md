# Proof-of-Humanity

## Concept

Proof-of-Humanity provides a way to store and verify that a certain address is a human rather than a bot.

The evidence could be verified on-chain by smart contract and off-chain: either by calling core API or by calling network RPC.

There could be multiple ways to verify humanity, hence the concept of `Delegates`. Delegates are trusted by the core owner and implement a specific way of humanity validation. No matter what method each delegate uses, finally, all proofs are stored within the core contract.

### Concept schema:

```
<Delegate> ---submit proof---> [      ]
                               [ Core ]
                               [      ] <---check proof--- <Anybody>
```

### Video

[<img src="https://img.youtube.com/vi/orJCAvCmWvw/maxresdefault.jpg" width="50%">](https://youtu.be/orJCAvCmWvw)

## Implementation

This repository provides an example of Proof-of-Humanity with a delegate using [hCaptcha](https://www.hcaptcha.com/) verification model.

### Contract

[`CoreEvidence`](contract/contracts/CoreEvidence.sol) contract provides methods to:

- add trusted delegate (only owner)
- submit proof-of-humanity for an address (only delegate)
- check proof-of-humanity for an address (anybody)

Evidence is stored as follows:

```
32 bytes: R (random data hash)
65 bytes: agent address ownership proof (ECDSA_SIG(R, address))
65 bytes: evidence data proof (ECDSA_SIG(R, delegate))
```

Evidence data for signing by the delegate is constructed as following bytes concatenation:

```
R | address | timestamp | ECDSA_SIG(R, address)
```

### Core

Live demo (Rinkeby testnet): https://proof-of-humanity-core-ui.glitch.me/

#### UI

`Core` implements basic UI for:

- add a trusted delegate
- check proof-of-humanity for an address

Local access: http://localhost:3001

### API

Method for checking proof-of-humanity for an address:

#### Request

```
GET /api/v1/verify/{address}
```

#### Response

```
{
  result: <boolean>
  timestamp: <ISO string>
}
```

### Delegate

Live demo (Rinkeby testnet): https://proof-of-humanity-delegate.glitch.me/

#### UI

`Delegate` implements basic UI for submitting proof-of-humanity using [hCaptcha](https://www.hcaptcha.com/).

Local access: http://localhost:3002

### API

Method for generating evidence based on [hCaptcha](https://www.hcaptcha.com/) `token` and `address` ownership `signature`:

#### Request

```
POST /api/v1/evidence/
Content-Type: application/json

{
  address: <hex string>
  R: <hex string>
  signature: <hex string>
  token: <hex string>
}
```

#### Response

```
{
  timestamp: <hex string>,
  evidence: <hex string>
}
```

## Quickstart

Start local development network. Run `ganache-cli` in deterministic mode, so it matches addresses provided as examples in `.env`.

```bash
# via NPM
npx ganache-cli --deterministic

# or via Docker
docker run --rm --publish 8545:8545 trufflesuite/ganache-cli:latest --deterministic
```

Deploy `CoreEvidence` smart contract from the `contract` directory to the development network.

```bash
cd contract
npm install
npm run deploy:ganache
```

Start `Core` and `Delegate` containers via Docker Compose from the root of the repository.

```bash
docker-compose up
```

Alternatively, you can start each of them separately using NPM:

```bash
# Core
cd core
npm install
npm start

# Delegate
cd core
npm install
npm start
```

### Access endpoints

Core UI: http://localhost:3001

Delegate UI: http://localhost:3002

### Metamask configuration

Ensure that this address is added to Metamask:

```
0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
```

Private key:

```
0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
```

This is the first address available when `ganache-cli` is started in deterministic mode. This address is the default owner of the core contract. It should be used to add the delegate.

## Author

Alex Bakoushin

## License

MIT
