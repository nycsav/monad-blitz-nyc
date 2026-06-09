# 🌊 MonadSwarm — Parallel AI Trading Agents on Monad

> **Monad Blitz NYC · June 2026**
> Built by [Sav Banerjee](https://github.com/nycsav) · [Enso Labs](https://ensolabs.ai)

[![Monad Testnet](https://img.shields.io/badge/Monad-Testnet%2010143-836EF9?style=flat-square&logo=ethereum)](https://testnet.monadexplorer.com)
[![Claude Haiku](https://img.shields.io/badge/Claude-Haiku%204.5-CC785C?style=flat-square)](https://anthropic.com)
[![Perplexity](https://img.shields.io/badge/Perplexity-Research%20%26%20GitHub%20MCP-20808D?style=flat-square)](https://perplexity.ai)
[![Vercel](https://img.shields.io/badge/Dashboard-Live-000000?style=flat-square&logo=vercel)](https://monad-swarm.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## What is MonadSwarm?

MonadSwarm is a **multi-agent AI trading system** that demonstrates Monad's parallel execution at its most literal: three autonomous trading agents — each with its own strategy, wallet, and on-chain identity — submit cryptographically-signed trade intents **concurrently into the same block**.

Each agent's reasoning is **permanently anchored on-chain** via a keccak256 hash, creating a tamper-evident, independently verifiable link between every off-chain AI decision and its on-chain action. This isn't a simulation — the contracts are deployed, verified, and producing real events on Monad testnet right now.

> **Honest disclosure:** The three transactions below used the mock signal heuristic (the `ANTHROPIC_API_KEY` was absent from `agents/.env` at run time, so the swarm correctly fell back). The on-chain mechanics — EIP-712 verification, anchoring, reputation updates, and parallel block inclusion — are 100% real. A re-run with a live Haiku 4.5 key produces identical on-chain behavior with genuine LLM reasoning hashes.

---

## 🔴 Live On-Chain Proof

**Three agents, one block (#37,216,124), chain ID 10143:**

| Agent | Strategy | Tx Hash |
|---|---|---|
| Agent 1 | Momentum | [`0x2bbd...b8d`](https://testnet.monadexplorer.com/tx/0x2bbd8e26cf72aa84fc5ddbce428168c312d9f2de3599d8031a3fd7cb45c83b8d) |
| Agent 2 | Mean Reversion | [`0x34aa...232`](https://testnet.monadexplorer.com/tx/0x34aa395ffb7b68143fcf783376435afc54ea41d7d0b0a1d9928e08d6858ae232) |
| Agent 3 | Arbitrage | [`0x2c9c...219`](https://testnet.monadexplorer.com/tx/0x2c9c27b4c681734cf78e27a6a379195684edd546209cf96432a5ef99a6e2f219) |

All three landed in a single block with tx-indices 4/5/6. Three distinct on-chain senders, one block — this is Monad's parallel execution in production.

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
├── agents/                  # Python swarm: 3 Claude Haiku agents
│   ├── swarm.py             # Parallel agent orchestration
│   ├── register_agents.py   # On-chain NFT registration
│   ├── fund_agents.py       # Wallet funding from deployer
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
│   │   ├── config.ts        # Public contract addresses (baked in)
│   │   └── components/      # Signal feed, agent cards, metrics
│   └── package.json
├── RESEARCH.md              # Deep research doc (Perplexity-powered)
├── CLAUDE.md                # Claude Code session context
└── README.md                # This file
```

---

## 🤖 AI & LLM Stack

This project was built entirely with AI-assisted development across a single hackathon day:

| Tool | Role |
|---|---|
| **Claude Haiku 4.5** | Agent signal generation target (on-chain reasoning hashes) |
| **Claude Code (Sonnet 4.5)** | Full-stack development, contract writing, debugging |
| **Perplexity AI (Max)** | Deep research, architecture planning, and GitHub repo management via MCP |
| **Conductor** | Multi-agent Claude Code orchestration (parallel workspaces) |
| **GitHub MCP** | Direct repo commits and PR management from Perplexity conversation |

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
# Fill in: DEPLOYER_PRIVATE_KEY, ANTHROPIC_API_KEY (Claude Haiku 4.5)
pip install -r requirements.txt
python register_agents.py   # Mint agent NFTs (once)
python swarm.py             # Launch parallel swarm
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

Live at: **[monad-swarm.vercel.app](https://monad-swarm.vercel.app)**

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
