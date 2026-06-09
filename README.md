# 🌊 MonadSwarm — Parallel AI Trading Agents on Monad

> **Monad Blitz NYC · June 2026**
> Built by [Sav Banerjee](https://github.com/nycsav) · [Enso Labs](https://ensolabs.ai)

[![Monad Testnet](https://img.shields.io/badge/Monad-Testnet%2010143-836EF9?style=flat-square&logo=ethereum)](https://testnet.monadexplorer.com)
[![Claude Haiku](https://img.shields.io/badge/Claude-Haiku%204.5-CC785C?style=flat-square)](https://anthropic.com)
[![Perplexity](https://img.shields.io/badge/Perplexity-Research-20808D?style=flat-square)](https://perplexity.ai)
[![Live Demo](https://img.shields.io/badge/Demo-Live-22c55e?style=flat-square&logo=vercel)](https://monad-blitz-nyc.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## What is MonadSwarm?

MonadSwarm is a **multi-agent AI trading system** that demonstrates Monad's parallel execution at its most literal: three autonomous Claude-powered trading agents — each with its own strategy, wallet, and on-chain identity — submit cryptographically-signed trade intents **concurrently into the same block**.

Each agent's reasoning is **permanently anchored on-chain** via a keccak256 hash, creating a tamper-evident, independently verifiable link between every off-chain AI decision and its on-chain action. This isn't a simulation — the contracts are deployed, verified, and producing real events on Monad testnet right now.

---

## 🔴 Live On-Chain Proof

**Parallel settlement — 3 agents, one block (#37,216,124), chain ID 10143:**

| Agent | Strategy | Tx Hash |
|---|---|---|
| Agent 1 | Momentum | [`0x2bbd...b8d`](https://testnet.monadscan.com/tx/0x2bbd8e26cf72aa84fc5ddbce428168c312d9f2de3599d8031a3fd7cb45c83b8d) |
| Agent 2 | Mean Reversion | [`0x34aa...232`](https://testnet.monadscan.com/tx/0x34aa395ffb7b68143fcf783376435afc54ea41d7d0b0a1d9928e08d6858ae232) |
| Agent 3 | Arbitrage | [`0x2c9c...219`](https://testnet.monadscan.com/tx/0x2c9c27b4c681734cf78e27a6a379195684edd546209cf96432a5ef99a6e2f219) |

All three landed in a single block (tx-indices 4/5/6) — three distinct senders, one block: Monad's parallel execution in production.

**Live Claude-Haiku 4.5 signals — anchored on-chain (blocks #37,217,877–878):**

| Agent | Strategy | Tx Hash |
|---|---|---|
| Agent 1 | Momentum (BULL) | [`0x7810...d50`](https://testnet.monadscan.com/tx/0x781028a996100008f396af76f3c57998bd40c6adbec49a1bbafa509b60176d50) |
| Agent 2 | Mean Reversion (BEAR) | [`0x7ffd...7e3`](https://testnet.monadscan.com/tx/0x7ffd580ac9227b2c48d4822f4622c77870b7e08a46f0f2350a3ca1d2c8a647e3) |
| Agent 3 | Arbitrage (BULL) | [`0x507d...c29`](https://testnet.monadscan.com/tx/0x507dcfe7f07d8fe0a1bcd1fff27bdaf267217f39b5f58d79337d58c7af049c29) |

Each agent's Claude-generated reasoning is keccak256-hashed and anchored via SignalAnchor (`totalSignals() = 6` across both runs).

---

## 📜 Deployed & Verified Contracts

All 4 contracts source-verified ("perfect match") on MonadVision + Socialscan:

| Contract | Address | Explorer |
|---|---|---|
| **AgentRegistry** | `0xaF9a75811aF8999b767813E78a9E6592eAF8b3e9` | [View](https://testnet.monadexplorer.com/address/0xaF9a75811aF8999b767813E78a9E6592eAF8b3e9) |
| **SignalAnchor** | `0xa07adbcB5Ff1C4204c574Da5C977e102848dcb68` | [View](https://testnet.monadexplorer.com/address/0xa07adbcB5Ff1C4204c574Da5C977e102848dcb68) |
| **SignalVault** | `0x2E3723c691A32f1e5Aa43f21fC3557034d26FF10` | [View](https://testnet.monadexplorer.com/address/0x2E3723c691A32f1e5Aa43f21fC3557034d26FF10) |
| **RiskRouter** | `0x88D7903951f618d625AAB8b50bE04D3434172a5D` | [View](https://testnet.monadexplorer.com/address/0x88D7903951f618d625AAB8b50bE04D3434172a5D) |

`totalSignals() = 6` — anchored across two swarm runs.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MonadSwarm System                        │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Agent 1  │  │ Agent 2  │  │ Agent 3  │  ← Claude Haiku  │
│  │Momentum  │  │MeanRev.  │  │Arbitrage │    (parallel)    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
│       │             │             │                        │
│       └─────────────┴─────────────┘                        │
│                     │                                      │
│           EIP-712 Signed Intents                           │
│                     │                                      │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │                  RiskRouter                          │  │
│  │         (on-chain EIP-712 verification)              │  │
│  └────────────┬─────────────────────────────────────────┘  │
│               │                                            │
│    ┌──────────▼──────────┐   ┌────────────────────────┐   │
│    │    SignalAnchor      │   │      AgentRegistry     │   │
│    │  keccak256 reasoning│   │  NFT-minted identities │   │
│    │  hash → on-chain    │   │  reputation tracking   │   │
│    └──────────┬──────────┘   └────────────────────────┘   │
│               │                                            │
│    ┌──────────▼──────────┐                                 │
│    │     SignalVault      │                                 │
│    │  trade execution +  │                                 │
│    │  Pyth price feeds   │                                 │
│    └─────────────────────┘                                 │
└─────────────────────────────────────────────────────────────┘
```

**Event chain per trade:**
`SignalAnchored` → `SignalCounted` → `ReputationUpdated` → `TradeExecuted`

---

## 📦 Repo Structure

```
monad-blitz-nyc/
├── agents/                  # TypeScript swarm: 3 Claude Haiku 4.5 agents
│   ├── src/swarm.ts         # Parallel agent orchestration (Promise.all)
│   ├── src/agent.ts         # One cycle: price → signal → EIP-712 sign → submit
│   ├── src/claude.ts        # Claude Haiku 4.5 structured signal brain
│   ├── src/register.ts      # On-chain agent NFT registration
│   ├── src/pyth.ts          # Pyth (Hermes) price feed
│   └── .env.example         # Required env vars (no secrets committed)
├── contracts/               # Solidity smart contracts
│   ├── src/
│   │   ├── AgentRegistry.sol
│   │   ├── SignalAnchor.sol
│   │   ├── SignalVault.sol
│   │   └── RiskRouter.sol
│   └── script/              # Foundry deploy scripts
├── frontend/                # Vite + React + wagmi dashboard
│   ├── src/
│   │   ├── App.tsx          # Main dashboard
│   │   ├── lib/config.ts    # Public contract addresses (baked in)
│   │   └── components/      # Signal feed, agent cards, metrics
│   └── package.json
├── RESEARCH.md              # Deep research doc (Perplexity-powered)
├── CLAUDE.md                # Claude Code session context
└── README.md                # This file
```

---

## 🤖 AI & LLM Stack

This project was built entirely with AI-assisted development:

| Tool | Role |
|---|---|
| **Claude Haiku 4.5** | Live agent signal generation (on-chain reasoning) |
| **Claude Code (Opus 4.8)** | Full-stack development, contract writing, debugging |
| **Perplexity AI (Max)** | Deep research — Monad architecture, EIP-712, Pyth feeds |
| **Conductor** | Multi-agent Claude Code orchestration (parallel workspaces) |
| **GitHub MCP** | Direct repo management from Perplexity conversation |

> The entire project — from zero blockchain experience to 4 deployed verified contracts — was built in a single hackathon day using this AI stack.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+, Python 3.11+, Foundry (`curl -L https://foundry.paradigm.xyz | bash`)
- Monad testnet MON (faucet: [monad.xyz/faucet](https://monad.xyz/faucet))

### Run the Dashboard (no setup needed)
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
# Public contract addresses are baked in — no .env required
```

### Run the Agent Swarm
```bash
cd agents
cp .env.example .env
# Fill in: AGENT1/2/3_PRIVATE_KEY, DEPLOYER_PRIVATE_KEY, ANTHROPIC_API_KEY
npm install
npm run register            # Mint agent NFTs (once)
npm run swarm -- --live     # Launch parallel Claude swarm
```

### Deploy Contracts (Foundry)
```bash
cd contracts
cp .env.example .env        # Fill in DEPLOYER_PRIVATE_KEY
forge build
forge script script/Deploy.s.sol --rpc-url https://testnet-rpc.monad.xyz --broadcast
```

---

## 🧠 Why Monad?

Standard EVM chains serialize transactions — three agents submitting simultaneously would queue up, paying priority fees to jump the line and waiting for sequential block inclusion. On Monad, **optimistic parallel execution** means all three can land in the same block without coordination overhead. MonadSwarm is designed to make that property visible and verifiable: same block, three distinct senders, one event log.

Key Monad properties used:
- **Parallel execution** — 3 agents, 1 block, no sequencing
- **10,000 TPS throughput** — swarm can scale to N agents
- **EVM-compatible** — standard Solidity, Foundry, wagmi, ethers.js
- **Pyth price feeds** — real-time on-chain market data for signal generation

---

## 🔬 Technical Highlights

### EIP-712 Signed Intents
Each agent constructs a typed structured data payload off-chain, signs it with its EOA private key, and submits to `RiskRouter` — which verifies the signature on-chain before executing. This prevents replay attacks and proves which agent submitted which intent.

### On-Chain Reasoning Hashes
```solidity
bytes32 reasoningHash = keccak256(abi.encodePacked(reasoning));
emit SignalAnchored(agentId, signalId, reasoningHash, pythPrice, direction);
```
The full reasoning string lives off-chain; the hash lives forever on Monad. Anyone can verify that a given reasoning string produced a given trade.

### Chunked getLogs (Monad RPC fix)
Monad's RPC caps `eth_getLogs` at ~100 blocks. The dashboard uses chunked 100-block queries that reconstruct the full event history — no silent empty responses.

### Agent Reputation
`AgentRegistry` tracks a running `reputationScore` per agent NFT, updated after every confirmed trade. Agents that anchor more signals accumulate higher reputation — the foundation for a decentralized agent marketplace.

---

## 📊 Demo Dashboard

**Live:** [monad-blitz-nyc.vercel.app](https://monad-blitz-nyc.vercel.app) — reads live `SignalAnchored` events directly from Monad testnet (no wallet needed).

Or run locally: `cd frontend && npm install && npm run dev` → http://localhost:5173

Features:
- Real-time signal feed from `SignalAnchored` events
- Agent cards with live reputation scores
- Pyth price at signal time
- Block explorer links for every tx
- `totalSignals` counter updating live

---

## 👤 Builder

**Sav Banerjee** — AI Strategy & Deployment Consultant, Founder of [Enso Labs](https://ensolabs.ai)

- Background: Digital advertising, CX strategy, AI agent systems
- **Zero blockchain experience before this hackathon** → 4 deployed verified contracts in one day
- Building: AI-powered market intelligence platforms, agentic trading systems

> MonadSwarm will be featured as a case study on [ensolabs.ai](https://ensolabs.ai) as a demonstration of what's possible when AI development tools meet a high-performance blockchain.

---

## License

MIT © 2026 Sav Banerjee / Enso Labs
