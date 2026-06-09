# Monad Blitz NYC — Hackathon Project

## Event Details
- **Date**: Tuesday, June 9, 2026
- **Time**: 9:00 AM – 9:00 PM EDT
- **Format**: One-day hackathon sprint (code 11:30 AM – 6:00 PM, then pitch)
- **Prizes**: 1st $2,500 / 2nd $1,500 / 3rd $1,000
- **Photo ID required** to enter venue
- **169 attendees** registered

## Rules (IMPORTANT)
- All projects must be NEW — no pre-built projects, no forks of existing code (standard libraries/boilerplates OK)
- Must deploy on **Monad Testnet** (chain ID 10143)
- Must be a **public GitHub repo** (this fork)
- Max team size: 4 (Sav is solo)
- Pre-brainstorming/planning encouraged, but all code written at event
- No direct clones of existing apps without significant innovation
- Judging is **peer-voted** — all participants vote, can't vote for own project

## Schedule
| Time | Activity |
|------|----------|
| 9:00–10:00 AM | Registration & Breakfast |
| 10:00–10:15 AM | Opening Address & Hackathon Briefing |
| 10:15–11:30 AM | Monad101 & Monskills Workshop |
| 11:30 AM–6:00 PM | **Hacking Period** |
| 6:00 PM | **Code Freeze & Submission Deadline** |
| 6:30–8:30 PM | Pitches (3 min each) |
| 8:30–9:00 PM | Prize Presentations |

## Submission Process
1. This repo IS the fork of `monad-developers/monad-blitz-nyc`
2. Build the project here, update README with project details
3. Go to **blitz.devnads.com** → Submit Project tab (opens when submissions open)
4. Fill in details, paste this fork's URL as GitHub URL
5. If no demo URL, enter GitHub URL again
6. Can edit submission until voting starts

## Judging Criteria (Peer Voting)
- **Novelty & Originality**: New ideas, unique approaches
- **Innovative Mechanics**: Clever smart contract designs, UX, Monad-specific features
- **Problem-Solving**: Creative solutions to real challenges
- **Learning & Experimentation**: Willingness to push boundaries
- NOT about polish — about innovation and ingenuity

## Demo Prep (3-minute pitch)
- Live demo on Monad Testnet is the core
- Slide deck optional (keep minimal if used)
- Audience is fellow developers — focus on tech, innovation, "wow" factor
- Have backup: screenshots + short video recording
- Tips: practice timing, focus on core innovation, get to demo fast, speak clearly

## Monad Technical Resources
- **Monad Docs**: https://docs.monad.xyz
- **Add Monad to Wallet**: https://docs.monad.xyz/guides/add-to-wallet/
- **Custom Foundry**: https://docs.monad.xyz/guides/custom-foundry
- **Deploy Smart Contract**: https://docs.monad.xyz/guides/deploy-smart-contract/
- **Verify Smart Contract**: https://docs.monad.xyz/guides/verify-smart-contract/
- **Tokens & Bridges**: https://docs.monad.xyz/dev/tokens-and-bridges
- **Monad vs Ethereum Differences**: https://docs.monad.xyz/dev/differences
- **Tooling & Infrastructure**: https://docs.monad.xyz/tooling-and-infra/
- **EIP-7702 on Monad**: https://docs.monad.xyz/dev/eip-7702
- **Reserve Balance**: https://docs.monad.xyz/dev/reserve-balance
- **x402 on Monad**: https://docs.monad.xyz/guides/x402-guide
- **8004 on Monad**: https://docs.monad.xyz/guides/8004-guide
- **Monskills**: https://skills.devnads.com/
- **Devnads Portal**: https://blitz.devnads.com (faucet, submissions, voting)
- **Templates**: Farcaster Mini App, React Native Privy wallet, Next.js PWA, Account Abstraction

## Sav's Background & Edge (from Dispatch Research)

### Builder Profile
- **Sav Banerjee** — Founder of Enso Labs, AI strategy & transformation consulting
- 15 years enterprise experience (Google, McCann, Publicis, Citi, JPMorgan, Amex)
- Certifications: Anthropic CCS, Google AI, OpenAI, Perplexity Fellow
- GitHub: nycsav — 21 repos (6 public, 13 private) across Python and TypeScript

### Prior Hackathon Experience
- **Notion Hackathon**: Built notion-career-agent (Notion Workers + Claude)
- **NY Tech Week PoC Fest** (June 1, 2026): Built Signal Lens — 3-agent intelligence pipeline (Perplexity Sonar + Claude), deployed to Vercel

### Production Systems Shipped
- **ensolabs.ai**: Next.js 14, 71 JSON-LD schemas, MCP endpoints, built in 24 hours
- **Signal Forge v2**: Multi-agent crypto trading (DeepSeek R1 + Alpaca Markets)
- **job-application-agent**: Playwright + Notion API + Greenhouse auto-submit pipeline
- **enso-trading-terminal**: Autonomous options trading with live brokerage
- **signal2noise-engine**: Autonomous research/curation/publishing (Firebase + React + Claude)

### Strongest Hackathon Angles (AI + Monad)
Past Monad Blitz winners (MindMesh, ChainMind, VoiceForms AI, Contract Copilot) are all AI + blockchain hybrids. Sav's AI agent expertise is the edge.

Potential directions:
1. On-chain AI agent that monitors DeFi data, synthesizes signals, autonomously executes
2. Multi-agent intelligence pipeline with on-chain verification/settlement
3. AI-powered market sensing with blockchain-anchored proof of analysis

### Solo Builder Strategy
- "Built in 6 hours with Claude as co-founder" is a compelling pitch narrative
- Solo = focused vision, no coordination overhead, faster iteration
- Peer-voted judging rewards novelty and experimentation over polish

## Dev Environment (Verified)
- Node.js v24.12.0, npm 11.6.2
- Git 2.47.1
- Python 3.13.1
- Foundry v1.7.1 (forge, cast, anvil, chisel)
- This repo: ~/Code/monad-blitz-nyc (fork of monad-developers/monad-blitz-nyc)

## Co-Founder Protocol
Claude is Sav's technical co-founder for this hackathon. When working in this repo:
- Sav architects and makes product decisions; Claude writes the code
- Move fast — we have ~6.5 hours of hacking time
- Prioritize working demo over clean code
- Always have a backup plan (screenshots, video) for the live demo
- Keep the README updated — it's part of the submission
- All code must be fresh (no copying from existing repos — but patterns and knowledge are fine)
- Deploy to Monad Testnet before 6 PM code freeze
- Prepare a 3-minute pitch script by 6 PM

## Build Instructions for Multi-Agent Trading Platform

### Project: MonadSwarm — Multi-Agent Parallel Trading Platform

**Tagline**: *"Parallel agents on a parallel chain"* — 3 specialized AI agents running simultaneous strategies, with every decision cryptographically anchored on-chain.

**Pitch angle**: Monad is the ONLY chain where multi-agent trading makes physical sense — 3 agents submit transactions concurrently, Monad's parallel EVM executes them simultaneously. Not simulated parallelism. Real.

---

### Architecture

```
Frontend (Next.js dashboard)
        │
Orchestrator (Node.js) — Promise.all([agent1, agent2, agent3])
        │
  ┌─────┼─────┐
Agent1  Agent2  Agent3
Momentum  MeanRev  Arbitrage
  └─────┬─────┘
        │ concurrent txns
Monad Testnet (chain 10143)
  AgentRegistry → RiskRouter → SignalVault
  SignalAnchor ← Pyth Oracle
```

**Each agent loop**: Pyth price pull → Claude Haiku signal → keccak256(reasoning) → EIP-712 TradeIntent → sign → submit to RiskRouter → anchor hash on SignalAnchor → sleep 400ms → repeat.

---

### Tech Stack

- **Smart contracts**: Solidity + Foundry v1.7.1
- **Frontend**: Next.js (App Router), viem, wagmi
- **Agent runtime**: Node.js TypeScript, ethers.js v6
- **AI**: Claude Haiku (`claude-haiku-4-5`) via `@anthropic-ai/sdk`
- **Oracle**: Pyth Network (pull oracle, 400ms cadence)
- **Micropayments**: x402 (`@x402/evm@2.12.0+`, `@x402/next`, `@x402/fetch`)
- **DEX**: Kuru Exchange (CLOB, limit orders) or Ambient Finance (AMM)

---

### Smart Contracts to Build

#### 1. `AgentRegistry.sol`
Registers the 3 AI agents with on-chain identity. Each agent gets a uint256 ID, an operator wallet (Sav's key), an agent wallet (signing key), and a `bytes32[]` capabilities array (`["momentum"]`, `["mean_reversion"]`, `["arbitrage"]`).

#### 2. `SignalVault.sol`
Shared treasury. Manages agent capital allocations. Key functions: `deposit(uint256)`, `executeAgentTrade(uint256 agentId, TradeIntent calldata, bytes calldata sig)`. Tracks `agentAllocations` and cumulative P&L.

#### 3. `RiskRouter.sol`
Safety layer — validates every trade before execution. Uses EIP-712 typed signing with this struct:
```solidity
struct TradeIntent {
    address asset;
    uint256 amount;
    bool isBuy;
    uint256 maxSlippage;   // basis points (50 = 0.5%)
    uint256 deadline;
    bytes32 reasoningHash; // keccak256 of Claude's reasoning text
    bytes32 nonce;
}
bytes32 constant TRADE_INTENT_TYPEHASH = keccak256(
    "TradeIntent(address asset,uint256 amount,bool isBuy,uint256 maxSlippage,uint256 deadline,bytes32 reasoningHash,bytes32 nonce)"
);
```
Checks: deadline not expired, nonce not replayed, signature recovers to registered agent wallet, position within limits.

#### 4. `SignalAnchor.sol`
The "wow" contract. Emits a verifiable on-chain log of every AI reasoning event:
```solidity
struct SignalRecord {
    uint256 agentId;
    bytes32 signalHash;       // keccak256(reasoning text)
    uint256 timestamp;
    int256 predictedDirection; // +1 bull, -1 bear
}
event SignalAnchored(uint256 indexed agentId, bytes32 signalHash, uint256 timestamp);
```
Any observer can verify that an AI decision existed before a trade by checking the hash.

---

### Key Contract Addresses on Testnet (do NOT hallucinate — use these exact values)

| Contract | Address |
|----------|---------|
| WMON | `0xFb8bf4c1CC7a94c73D209a149eA2AbEa852BC541` |
| USDC (Circle native) | `0x534b2f3A21130d7a60830c2Df862319e593943A3` |
| Pyth Network | `0x2880aB155794e7179c9eE2e38200202908C17B43` |
| Pyth MON/USD feed ID | `0xad2B52D2af1a9bD5c561894Cdd84f7505e1CD0B5` |
| Chainlink ETH/USD | `0x0c76859E85727683Eeba0C70Bc2e0F5781337818` |
| Chainlink BTC/USD | `0x2Cd9D7E85494F68F5aF08EF96d6FD5e8F71B4d31` |
| ERC-4337 EntryPoint v0.7 | `0x0000000071727De22E5E9d8BAf0edAc6f37da032` |
| ERC-4337 EntryPoint v0.8 | `0x4337084d9e255ff0702461cf8895ce9e3b5ff108` |
| Permit2 | `0x000000000022d473030f116ddee9f6b43ac78ba3` |
| x402 USDC Proxy (upto/Permit2) | `0x4020A4f3b7b90ccA423B9fabCc0CE57C6C240002` |
| x402 Facilitator URL | `https://x402-facilitator.molandak.org` |
| Multicall3 | `0xcA11bde05977b3631167028862bE2a173976CA11` |

**RPC**: `https://testnet-rpc.monad.xyz` (primary), `https://rpc.ankr.com/monad_testnet` (fallback)
**Explorer**: `https://testnet.monadscan.com`
**Chain ID**: `10143`

---

### x402 Integration (agent-to-agent micropayments)

Use `@x402/evm@2.12.0` or higher. **Do NOT use 2.9–2.11** — those versions have a bug with the wrong proxy address.

Pattern: Agent 3 (Arbitrage) calls Agent 1's signal API at `POST /api/signal`, which is protected by x402 middleware requiring $0.001 USDC. Agent 3 pays automatically via `wrapFetchWithPayment`. This creates a live agent economy on-chain — one of the strongest demo moments.

```typescript
// Server: protect the signal endpoint
import { HTTPFacilitatorClient, x402ResourceServer, ExactEvmScheme } from '@x402/next';
const facilitator = new HTTPFacilitatorClient({ url: "https://x402-facilitator.molandak.org" });

// Client: agent pays automatically
import { wrapFetchWithPayment } from '@x402/fetch';
const paymentFetch = wrapFetchWithPayment(fetch, walletClient);
const signal = await paymentFetch("/api/signal"); // pays 0.001 USDC if 402 returned
```

USDC address for x402: `0x534b2f3A21130d7a60830c2Df862319e593943A3`
Network string: `"eip155:10143"`

---

### reasoningHash Pattern (on-chain AI verifiability)

This is the core innovation. Before submitting any trade, hash Claude's reasoning and anchor it:

```typescript
// 1. Get Claude's signal
const response = await claude.messages.create({
  model: "claude-haiku-4-5",
  messages: [{ role: "user", content: buildStrategyPrompt(price, strategy) }]
});
const reasoningText = response.content[0].text;

// 2. Hash it
import { keccak256, toBytes } from 'viem';
const reasoningHash = keccak256(toBytes(reasoningText));

// 3. Embed in trade intent (EIP-712)
const intent = { ..., reasoningHash, ... };

// 4. Anchor on-chain BEFORE or WITH the trade
await signalAnchor.anchor(agentId, reasoningHash, currentPrice);
```

Result: anyone can verify any trade by checking the `SignalAnchored` event and reconstructing the hash from the original reasoning text.

---

### 6-Hour Build Timeline

| Hour | Time | Goal | Key Tasks |
|------|------|------|-----------|
| 1 | 11:30–12:30 | Deploy contracts | `forge init`, write 4 contracts, deploy to chain 10143, fund wallets from faucet |
| 2 | 12:30–1:30 | Single agent working | Pyth price pull, Claude Haiku call, reasoningHash, EIP-712 sign, submit tx, verify on Monadscan |
| 3 | 1:30–2:30 | 3 parallel agents | 3 strategy configs, 3 wallets, `Promise.all()`, verify concurrent txns in block explorer |
| 4 | 2:30–3:30 | Frontend dashboard | Next.js, viem event subscriptions, agent cards, live trade feed, "Launch Agents" button |
| 5 | 3:30–4:30 | x402 + polish | Install x402 libs, protect signal API, agent-to-agent payment demo, show payment events in UI |
| 6 | 4:30–6:00 | DEX + pitch prep | Kuru/Ambient integration, screen record backup, 3-min pitch script, README update, final deploy check |

**Minimal Viable Pivot** (if behind): Drop DEX trades, keep AgentRegistry + SignalAnchor + 3 agents anchoring reasoning hashes. Still novel, still demo-able.

---

### Submission Requirements

1. Deploy all contracts to Monad Testnet (chain ID `10143`)
2. Note all deployed contract addresses — add to README
3. Push everything to this public GitHub repo before 6 PM
4. Update `README.md` with: project name, description, contract addresses, demo instructions
5. Submit at `https://blitz.devnads.com` → Submit Project tab
   - GitHub URL: this repo's URL
   - Demo URL: deployed frontend URL (or GitHub URL if no frontend deployment)
6. Can edit submission until voting opens

---

## Quick Start Commands

```bash
# 1. Set up Foundry project
forge init monad-swarm
cd monad-swarm

# 2. Set environment variables
cp .env.example .env
# Edit .env: MONAD_TESTNET_RPC, PRIVATE_KEY, ANTHROPIC_API_KEY

# 3. Deploy contracts to Monad Testnet
forge create --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY --chain-id 10143 \
  src/AgentRegistry.sol:AgentRegistry

forge create --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY --chain-id 10143 \
  src/SignalAnchor.sol:SignalAnchor

forge create --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY --chain-id 10143 \
  src/RiskRouter.sol:RiskRouter

forge create --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY --chain-id 10143 \
  src/SignalVault.sol:SignalVault

# 4. Run contract tests against a fork
forge test --fork-url https://testnet-rpc.monad.xyz --chain-id 10143

# 5. Bootstrap the agent runtime
mkdir agent && cd agent
npm init -y
npm install @anthropic-ai/sdk ethers viem @x402/fetch @x402/evm@2.12.0 dotenv

# 6. Bootstrap the frontend
npx create-next-app@latest dashboard --typescript --tailwind --app
cd dashboard
npm install viem wagmi @x402/next

# 7. Start the frontend dev server
cd dashboard && npm run dev

# 8. Verify a deployed contract on Monadscan
forge verify-contract <DEPLOYED_ADDRESS> src/SignalAnchor.sol:SignalAnchor \
  --rpc-url https://testnet-rpc.monad.xyz \
  --chain-id 10143 \
  --verifier blockscout \
  --verifier-url https://testnet.monadscan.com/api

# 9. Cast: check MON balance
cast balance $WALLET_ADDRESS --rpc-url https://testnet-rpc.monad.xyz

# 10. Cast: send a test transaction
cast send $CONTRACT_ADDRESS "anchor(uint256,bytes32,int256)" \
  1 0xabc...123 1 \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY
```
