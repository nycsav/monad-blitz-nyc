# 🐝 MonadSwarm

**Parallel AI trading agents on Monad's parallel EVM — with on-chain proof-of-cognition.**

Three autonomous agents, each powered by **Claude Haiku 4.5**, independently generate trade signals, sign them with **EIP-712**, and settle them **concurrently** on Monad testnet. Every agent's reasoning is keccak256-hashed and **anchored on-chain**, making each AI decision cryptographically verifiable and tamper-evident.

Built solo in one day at **Monad Blitz NYC** (June 9, 2026) — Claude as co-founder.

---

## Why Monad

Monad's optimistic **parallel execution** + 400ms blocks mean multiple agents submitting to different markets settle *simultaneously*, not queued. This isn't simulated parallelism — the chain executes the agents' transactions concurrently. **Parallel agents on a parallel chain.**

## Live on Monad Testnet (chain 10143) — all 4 contracts source-verified ✅

| Contract | Role | Address |
|---|---|---|
| **AgentRegistry** | Each agent is an NFT (operator + autonomous signing wallet + on-chain reputation) | [`0xaF9a…b3e9`](https://testnet.monadscan.com/address/0xaF9a75811aF8999b767813E78a9E6592eAF8b3e9) |
| **SignalAnchor** | Proof-of-cognition: anchors each reasoning hash + price snapshot | [`0xa07a…cb68`](https://testnet.monadscan.com/address/0xa07adbcB5Ff1C4204c574Da5C977e102848dcb68) |
| **SignalVault** | Shared USDC treasury, per-agent capital allocation | [`0x2E37…FF10`](https://testnet.monadscan.com/address/0x2E3723c691A32f1e5Aa43f21fC3557034d26FF10) |
| **RiskRouter** | EIP-712 TradeIntent verification + risk guards | [`0x88D7…2a5D`](https://testnet.monadscan.com/address/0x88D7903951f618d625AAB8b50bE04D3434172a5D) |

## Proof of on-chain activity

3 agents, real Claude-Haiku signals, settled in consecutive blocks (#37217877–37217878):

- **Momentum** (BULL, conf 85) → [tx](https://testnet.monadscan.com/tx/0x781028a996100008f396af76f3c57998bd40c6adbec49a1bbafa509b60176d50)
- **MeanReversion** (BEAR, conf 75) → [tx](https://testnet.monadscan.com/tx/0x7ffd580ac9227b2c48d4822f4622c77870b7e08a46f0f2350a3ca1d2c8a647e3)
- **Arbitrage** (BULL, conf 85) → [tx](https://testnet.monadscan.com/tx/0x507dcfe7f07d8fe0a1bcd1fff27bdaf267217f39b5f58d79337d58c7af049c29)

`SignalAnchor.totalSignals()` = **6** anchored to date.

## How it works

```
   Pyth (Hermes pull oracle)              Claude Haiku 4.5
            │ live price                        │ structured signal
            ▼                                    ▼
   ┌──────────────── agent (×3, parallel) ────────────────┐
   │  reasoning → keccak256 hash → EIP-712 TradeIntent      │
   └───────────────────────────┬───────────────────────────┘
                               │ signed intent (own wallet)
                               ▼
   RiskRouter.executeIntent  ── verifies signer == registered agent wallet
        │  replay / deadline / slippage / position guards
        ├─▶ SignalAnchor.anchor()    reasoning hash + price snapshot ON-CHAIN
        ├─▶ AgentRegistry            signal + trade counters (reputation)
        └─▶ TradeExecuted event
```

Because each agent submits from its **own wallet**, the three transactions hit Monad as independent senders and settle in the same/adjacent block — real parallel execution, verifiable on-chain.

## Architecture

| Dir | What |
|---|---|
| `contracts/` | Foundry · Solidity 0.8.28 · OpenZeppelin v5 · 4 contracts, **4/4 tests passing** |
| `agents/` | TypeScript orchestrator · viem + `@anthropic-ai/sdk` · Pyth → Claude → EIP-712 sign → submit · parallel swarm via `Promise.all` |
| `frontend/` | Vite + React + wagmi + viem · live `SignalAnchored` event feed, agent cards, parallel-execution cue |

## Run it

```bash
# Contracts
cd contracts && forge test && ./deploy.sh

# Agents (real Claude signals need ANTHROPIC_API_KEY in agents/.env)
cd agents && npm install && npm run swarm -- 3 --live

# Dashboard — reads live on-chain data out of the box
cd frontend && npm install && npm run dev   # → http://localhost:5173
```

## Stack

Monad testnet · Foundry · Solidity + OpenZeppelin · viem/wagmi · **Claude Haiku 4.5** · Pyth (Hermes) · EIP-712 · Vite/React

---

*Built at Monad Blitz NYC · solo · with Claude as technical co-founder.*
