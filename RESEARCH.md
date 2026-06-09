# Monad Blitz NYC — Hackathon Research
*Compiled: June 9, 2026 — Sav Banerjee, solo builder*

---

## Executive Summary

Building a multi-agent parallel AI trading platform on Monad is highly feasible in a 6-hour sprint. All critical infrastructure is live on testnet today: RPC endpoints, USDC stablecoin, WMON, price oracles (Pyth + Chainlink), at least two trading DEXes (Kuru CLOB and Ambient AMM), x402 agent micropayments (production-ready), and EIP-7702 smart account delegation. Monad's 10,000 TPS / 400ms block time / parallel execution makes it the ideal host for a multi-agent trading system where agents submit trades concurrently — the network is literally architected for this. The "wow" angle: demonstrate 3-5 AI agents running parallel strategies, submitting real on-chain trades through a shared vault contract with on-chain signal verification, making it verifiably different from a centralized algo-trader.

---

## 1. Monad Architecture & Parallel Execution

### Core Innovation: Optimistic Parallel Execution

Monad uses **optimistic concurrency** — not sequential execution like Ethereum:

1. **Phase 1 (Speculative Execution)**: All transactions in a block are dispatched to multiple CPU cores simultaneously on the *assumption* that they don't conflict in state access.
2. **Phase 2 (Conflict Detection)**: The runtime checks if multiple transactions touched the same storage slots. If conflicts are found, conflicting transactions are re-executed in linear order; non-conflicting results are committed as-is.
3. **Result**: If most transactions are non-conflicting (typical in DeFi — different user wallets, different markets), effective throughput approaches linear scaling with CPU cores.

### Why This Matters for Multi-Agent Trading

- Multiple AI agents submitting trades to **different markets** (ETH/USD, BTC/USD, MON/USDC) will be executed **in parallel by the network itself** — true physical parallelism.
- A multi-agent system on Monad isn't just simulated parallelism — the blockchain actually executes agent actions concurrently.
- This is the core "Monad-native" pitch: *parallel agents on a parallel chain*.

### Five Architecture Pillars

| Component | What It Does |
|-----------|-------------|
| **MonadBFT** | Custom BFT consensus; solves tail-forking; sub-second finality |
| **RaptorCast** | Efficient block propagation to validators |
| **Asynchronous Execution** | Consensus and execution are pipelined (happen simultaneously, not sequentially) |
| **Parallel Execution + JIT** | Optimistic parallel EVM + JIT compilation of EVM bytecode |
| **MonadDB** | Custom state database optimized for async parallel reads/writes |

### Performance Specs

- **Throughput**: 10,000 TPS
- **Block Time**: 400 milliseconds  
- **Finality**: 800 milliseconds (single-slot)
- **EVM Compatibility**: Full EVM bytecode + Ethereum JSON-RPC API

### Monad vs Ethereum Key Differences

- Full EVM bytecode compatibility — existing Solidity contracts deploy unchanged
- `CREATE` and `CREATE2` **revert** when called from within a delegated EOA context (EIP-7702)
- **10 MON reserve balance rule** for EIP-7702 delegated accounts: transaction will revert if it would bring the balance below 10 MON
- Gas pricing and opcode pricing may differ from Ethereum mainnet — verify via docs
- No mempool congestion at 10,000 TPS — key advantage for agent transaction submission

---

## 2. Testnet Configuration

### Network Details

| Parameter | Value |
|-----------|-------|
| **Network Name** | Monad Testnet |
| **Chain ID** | `10143` |
| **Native Currency** | MON |
| **Current Version** | v0.13.1 (MONAD_NINE) |

### RPC Endpoints (Testnet)

| Provider | HTTP URL | WebSocket | Rate Limit |
|----------|----------|-----------|------------|
| QuickNode (primary) | `https://testnet-rpc.monad.xyz` | `wss://testnet-rpc.monad.xyz` | 50 rps (25 for eth_call) |
| Ankr | `https://rpc.ankr.com/monad_testnet` | — | 300 req/10s |
| Monad Foundation | `https://rpc-testnet.monadinfra.com` | `wss://rpc-testnet.monadinfra.com` | 20 rps |

**Recommended**: Use `https://testnet-rpc.monad.xyz` as primary, `https://rpc.ankr.com/monad_testnet` as fallback.

### Foundry / Hardhat Config

```bash
# .env
MONAD_TESTNET_RPC=https://testnet-rpc.monad.xyz
CHAIN_ID=10143
PRIVATE_KEY=0x...

# forge deploy
forge create --rpc-url $MONAD_TESTNET_RPC --private-key $PRIVATE_KEY \
  --chain-id 10143 src/YourContract.sol:YourContract
```

### Block Explorers

- **MonadVision**: https://testnet.monadvision.com
- **Monadscan**: https://testnet.monadscan.com
- **Socialscan**: https://monad-testnet.socialscan.io

### Faucets

| Faucet | Amount | Frequency |
|--------|--------|-----------|
| **Official**: https://faucet.monad.xyz | 10 MON (needs 0.001 ETH on mainnet) or 0.5 MON (no prereq) | 24 hours |
| **Alchemy**: https://www.alchemy.com/faucets/monad-testnet | varies | 24 hours |
| **QuickNode**: https://faucet.quicknode.com/monad | varies | 12 hours |

### Key Canonical Contract Addresses (Testnet)

| Contract | Address |
|----------|---------|
| Wrapped MON (WMON) | `0xFb8bf4c1CC7a94c73D209a149eA2AbEa852BC541` |
| USDC (Circle native) | `0x534b2f3A21130d7a60830c2Df862319e593943A3` |
| Permit2 | `0x000000000022d473030f116ddee9f6b43ac78ba3` |
| Multicall3 | `0xcA11bde05977b3631167028862bE2a173976CA11` |
| ERC-4337 EntryPoint v0.7 | `0x0000000071727De22E5E9d8BAf0edAc6f37da032` |
| ERC-4337 EntryPoint v0.8 | `0x4337084d9e255ff0702461cf8895ce9e3b5ff108` |
| x402 USDC Proxy (upto/Permit2) | `0x4020A4f3b7b90ccA423B9fabCc0CE57C6C240002` |

---

## 3. DeFi Protocols on Testnet

### DEXes

#### Kuru Exchange (PRIMARY TARGET)
- **URL**: https://kuru.io | **Docs**: https://docs.kuru.io
- **Model**: Hybrid CLOB + AMM — the first fully on-chain CLOB on EVM
- **Why use it**: Limit orders, low gas, composable, SDK available
- **SDK**: OrderBook SDK + Vault SDK (see docs.kuru.io)
- **Funding**: $11.5M Series A (Paradigm), July 2025
- **Testnet**: Live on Monad testnet
- **For agents**: Agents can place limit orders programmatically — no slippage, deterministic execution

#### Ambient Finance
- **URL**: https://ambient.finance
- **Model**: AMM with automated liquidity management
- **Features**: Swaps, limit orders, LP fee earning
- **Testnet**: Live — supports MON/USDC, WETH, WBTC swaps

#### Monday.trade
- **Model**: Hybrid AMM + on-chain order book
- **Testnet**: Live

#### Likwid
- **Model**: AMM + lending in one system (no oracles or counterparties)
- **Testnet**: Live

### Price Oracles

#### Pyth Network (RECOMMENDED — 400ms latency)
- **Contract**: `0x2880aB155794e7179c9eE2e38200202908C17B43` (primary)
- **MON/USD Beta Feed**: `0xad2B52D2af1a9bD5c561894Cdd84f7505e1CD0B5`
- **VRF/Entropy**: `0x36825bf3Fbdf5a29E2d5148bfe7Dcf7B5639e320`
- **Pull oracle** — agents pull price updates on-demand
- 400ms price update cadence matches Monad block time perfectly

#### Chainlink (PUSH — reliable, well-tested)
- **BTC/USD**: `0x2Cd9D7E85494F68F5aF08EF96d6FD5e8F71B4d31`
- **ETH/USD**: `0x0c76859E85727683Eeba0C70Bc2e0F5781337818`
- **USDC/USD**: `0x70BB0758a38ae43418ffcEd9A25273dd4e804D15`
- **Data Streams Verifier**: `0xC539169910DE08D237Df0d73BcDa9074c787A4a1`

#### Stork (Pull Oracle)
- **Contract**: `0xacC0a0cF13571d30B4b8637996F5D6D774d4fd62`
- MON/USD feed available

#### Switchboard (Pull Oracle)
- **Contract**: `0xD3860E2C66cBd5c969Fa7343e6912Eff0416bA33`

### Testnet Tokens Summary

| Token | Address | Source |
|-------|---------|--------|
| MON (native) | — | Faucet: https://faucet.monad.xyz |
| WMON | `0xFb8bf4c1CC7a94c73D209a149eA2AbEa852BC541` | Wrap MON |
| USDC (native Circle) | `0x534b2f3A21130d7a60830c2Df862319e593943A3` | Circle testnet faucet |
| USDC/WMON LP | `0x58b0422002e96cf984ccdbdaee658697889a34a9` | Uniswap V2 style pool |

**USDC faucet**: Circle provides free testnet USDC — access via Circle's developer portal.

---

## 4. x402 Protocol (Agent Micropayments)

### What It Is

x402 is an **HTTP 402-based micropayment protocol** enabling instant, machine-to-machine stablecoin payments over HTTP. Originally proposed by Coinbase in May 2025. The protocol is **production-ready on Monad testnet**.

### How It Works

```
1. Agent A requests resource from Agent B's API
2. Agent B responds: HTTP 402 + payment requirements (amount, token, address)
3. Agent A signs EIP-712 authorization locally (no tx yet — just a signature)
4. Agent A resends request with PAYMENT-SIGNATURE header
5. Facilitator settles the on-chain payment
6. Agent B serves the resource
```

No API keys, no subscriptions, no human intervention. True machine-to-machine billing.

### Monad Testnet Addresses

| Contract | Address |
|----------|---------|
| USDC Token | `0x534b2f3A21130d7a60830c2Df862319e593943A3` |
| x402UptoPermit2Proxy | `0x4020A4f3b7b90ccA423B9fabCc0CE57C6C240002` |

**Facilitator URL**: `https://x402-facilitator.molandak.org`

### Payment Schemes

| Scheme | Use Case | Library Version |
|--------|----------|-----------------|
| `v2-eip155-exact` | Fixed-price (e.g., $0.01 per API call) | `@x402/evm >= 2.2.0` |
| `v2-eip155-upto` | Variable/metered payments | `@x402/evm 2.12.0+` |

**WARNING**: `@x402/evm 2.9.0–2.11.0` has a bug with the wrong proxy address — use `2.12.0+`.

### Implementation (TypeScript / Next.js)

```typescript
import { HTTPFacilitatorClient, x402ResourceServer, ExactEvmScheme } from '@x402/next';

const MONAD_NETWORK = "eip155:10143";
const MONAD_USDC = "0x534b2f3A21130d7a60830c2Df862319e593943A3";

// Server side: protect a route
const facilitator = new HTTPFacilitatorClient({ 
  url: "https://x402-facilitator.molandak.org" 
});
const server = new x402ResourceServer(facilitator);
server.register(MONAD_NETWORK, new ExactEvmScheme());

// Client side: wrap fetch with payment capability
import { wrapFetchWithPayment } from '@x402/fetch';
const paymentFetch = wrapFetchWithPayment(fetch, walletClient);
const response = await paymentFetch("/api/signal-data");
```

### Hackathon Use Case

- **Signal marketplace**: Agents pay other agents for proprietary trading signals
- **Agent-as-a-service**: Strategy agent charges for each trade recommendation
- Enables a real **agent economy** on-chain — this is a strong demo moment

---

## 5. EIP-7702 (Smart Account Delegation / Agent Accounts)

### What It Is

EIP-7702 allows any EOA (regular wallet) to **temporarily set smart contract code**, gaining batching, gas sponsorship, and custom auth — without migrating funds. Transaction type `0x04`.

### How It Works

1. EOA signs an authorization designating a smart contract address
2. Type `0x04` transaction submitted (by EOA or third party)
3. EOA now has contract code: `0xef0100` + smart contract address
4. Subsequent transactions (`0x02`) can invoke that code

### Monad-Specific Rules

- **10 MON reserve**: Delegated accounts cannot go below 10 MON via transaction execution
- `CREATE`/`CREATE2` revert when called from delegated EOA context
- Undelegating (delegate to `0x000...`) allows emptying the account

### TypeScript Example (viem)

```typescript
import { createWalletClient, http } from 'viem';
import { monadTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount('0x...');
const walletClient = createWalletClient({
  account,
  chain: monadTestnet,
  transport: http('https://testnet-rpc.monad.xyz'),
});

// Delegate EOA to a smart contract (agent logic contract)
const authorization = await walletClient.signAuthorization({
  account,
  contractAddress: AGENT_LOGIC_CONTRACT_ADDRESS,
});

const hash = await walletClient.sendTransaction({
  authorizationList: [authorization],
  data: encodedCallData,
  to: walletClient.account.address,
});
```

### Agent Use Cases

- **Gasless execution**: A deployer/orchestrator sponsors agent gas via delegation
- **Batch operations**: Agent executes multiple DEX trades atomically in one tx
- **Session keys**: Delegate limited execution authority to AI agent for a time window
- **ERC-4337 compatibility**: Delegated EOAs function as smart accounts

---

## 6. Smart Contract Patterns for Agent Coordination

### Recommended Architecture: "Parallel Signal Vault"

Five contracts, each with a clear role:

#### Contract 1: AgentRegistry (ERC-721)
```solidity
// Each AI agent gets an NFT representing its identity
struct AgentMetadata {
    address operatorWallet;    // human owner
    address agentWallet;       // AI's signing key
    bytes32[] capabilities;    // ["momentum", "mean_reversion", "arb"]
    uint256 registeredAt;
    uint256 reputationScore;
}
mapping(uint256 => AgentMetadata) public agents;
```

#### Contract 2: SignalVault (Core — manages capital)
```solidity
// Shared treasury; agents propose allocations
mapping(address => uint256) public agentAllocations;
function deposit(uint256 amount) external;
function executeAgentTrade(
    uint256 agentId,
    TradeIntent calldata intent,
    bytes calldata agentSig
) external;
```

#### Contract 3: RiskRouter (Safety layer)
```solidity
// Validates every trade before execution
struct TradeIntent {
    address asset;
    uint256 amount;
    bool isBuy;
    uint256 maxSlippage;
    uint256 deadline;
    bytes32 reasoningHash;    // hash of AI reasoning string
    bytes32 nonce;
}
// Checks: deadline, nonce replay, signature recovery, position limits, daily loss cap
```

#### Contract 4: ReputationRegistry
```solidity
// On-chain P&L tracking per agent
mapping(uint256 => int256) public cumulativePnL;
mapping(uint256 => uint256) public totalTrades;
mapping(uint256 => uint256) public winRate;     // basis points
```

#### Contract 5: SignalAnchor (Proof of analysis)
```solidity
// Verifiable log of AI reasoning — the "wow" factor
struct SignalRecord {
    uint256 agentId;
    bytes32 signalHash;       // keccak256 of full signal JSON
    uint256 timestamp;
    bytes32 priceAtSignal;    // Pyth price feed snapshot
    int256 predictedDirection; // +1 bull, -1 bear
}
event SignalAnchored(uint256 indexed agentId, bytes32 signalHash, uint256 timestamp);
```

### Key Design Pattern: EIP-712 Typed Signing

```solidity
bytes32 constant TRADE_INTENT_TYPEHASH = keccak256(
    "TradeIntent(address asset,uint256 amount,bool isBuy,uint256 maxSlippage,uint256 deadline,bytes32 reasoningHash,bytes32 nonce)"
);
```

The AI agent signs `TradeIntent` structs off-chain. The `reasoningHash` is a `keccak256` of the agent's reasoning text — creating an auditable, tamper-proof link between AI cognition and on-chain action.

---

## 7. Available Tooling & SDKs

### Core EVM Libraries
- **viem** — Modern TypeScript Ethereum library; `monadTestnet` chain built-in
- **ethers.js v6** — Works out of the box with Monad RPC
- **Foundry** (v1.7.1 installed) — `forge`, `cast`, `anvil`; full Monad support

### AI / Agent Frameworks
- **Anthropic SDK** (`@anthropic-ai/sdk`) — Claude as trading strategy brain
- **AINad** (Techgethr) — TypeScript AI agent framework for Monad, uses 0x + aPriori
- **0x Protocol** — DEX aggregation SDK available on Monad

### x402 Libraries
- `@x402/core` — Core protocol client
- `@x402/evm` — EVM scheme (use `>=2.12.0`)
- `@x402/fetch` — HTTP fetch wrapper with payment
- `@x402/next` — Next.js middleware

### Monskills (Claude Code / AI Assistant Plugin)
- Install: `npx skills add therealharpaljadeja/monskills`
- Pre-built Monad development skills for Cursor/Claude Code
- Good for rapid contract scaffolding

### Monad MCP Server
- Repo: https://github.com/monad-developers/monad-mcp
- Next.js MCP server template for building Monad-aware tools
- Can be adapted to expose Monad chain data as MCP tools to Claude

### Account Abstraction
- Repo: https://github.com/monad-developers/account-abstraction
- ERC-4337 full implementation (EntryPoint, SimpleAccount, Paymaster)
- EntryPoint v0.7: `0x0000000071727De22E5E9d8BAf0edAc6f37da032`
- EntryPoint v0.8: `0x4337084d9e255ff0702461cf8895ce9e3b5ff108`

### Monad SSE-based MCP
- Repo: https://github.com/monad-developers/monad-sse-mcp
- Real-time event streaming from Monad chain via SSE

### Execution Events SDK
- Repo: https://github.com/monad-developers/monode (monode)
- SDK for consuming Monad's execution events in real time

---

## 8. GitHub Repos of Interest

### monad-developers org

| Repo | Description | Priority |
|------|-------------|----------|
| `monad-mcp` | MCP server template | High — adapt for agent tools |
| `x402-workshop` | x402 payment demo (Next.js + wagmi) | High — copy patterns |
| `x402-rs` | x402 in Rust (verify/settle/monitor) | Reference |
| `account-abstraction` | ERC-4337 full implementation | High — use EntryPoint |
| `monode` | Execution Events SDK | Medium — live trade monitoring |
| `monad-sse-mcp` | SSE MCP tutorial | Medium |
| `monad-miniapp-template` | Next.js Farcaster mini-app | Low |
| `send-transaction-sync-example` | Sync tx sending example | High — copy for agent tx |
| `portfolio-dashboard-example` | Moralis API dashboard | Reference |
| `staking-sdk-cli` | Staking SDK | Low |

### External Repos
| Repo | URL |
|------|-----|
| AINad (AI agent framework) | https://github.com/Techgethr/ainad |
| Monad testnet automation bot | https://github.com/rjykgafi/monad-testnet-auto |

---

## 9. Recommended Architecture for Hackathon

### Project Name: "ParallelMind" (or "Monad Signal Engine")

**Tagline**: *N autonomous AI agents running parallel strategies, settling on-chain via Monad's parallel EVM — the first truly parallel multi-agent trading system.*

### System Overview

```
┌─────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js)                  │
│  Live dashboard: agent states, signals, P&L, txns   │
└─────────────────────────┬───────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────┐
│              ORCHESTRATOR (Node.js)                  │
│  Spawns N agent threads in parallel (Promise.all)    │
│  Each agent: Claude Haiku → TradeIntent → sign → tx  │
└──────┬──────────────┬──────────────┬────────────────┘
       │              │              │
 ┌─────▼─────┐  ┌────▼─────┐  ┌────▼─────┐
 │  Agent 1  │  │  Agent 2  │  │  Agent 3 │
 │ Momentum  │  │  MeanRev  │  │  Arb     │
 │ Strategy  │  │  Strategy │  │  Strategy│
 └─────┬─────┘  └────┬─────┘  └────┬─────┘
       │              │              │
       └──────────────▼──────────────┘
                      │ concurrent txns
┌─────────────────────▼───────────────────────────────┐
│              MONAD TESTNET (Chain 10143)             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │  Signal  │ │  Risk    │ │ Vault    │             │
│  │  Anchor  │ │  Router  │ │ Contract │             │
│  └──────────┘ └──────────┘ └──────────┘             │
│       │ Pyth Oracle  │ Kuru DEX  │ USDC             │
└─────────────────────────────────────────────────────┘
```

### Each Agent's Loop (runs in parallel)

```typescript
async function agentLoop(agentConfig: AgentConfig) {
  while (true) {
    // 1. Pull live price from Pyth oracle
    const price = await pythContract.getPriceNoOlderThan(priceFeedId, 60);
    
    // 2. AI generates signal (Claude Haiku — fast + cheap)
    const signal = await claude.messages.create({
      model: "claude-haiku-4-5",
      messages: [{ role: "user", content: buildPrompt(price, agentConfig.strategy) }]
    });
    
    // 3. Hash reasoning for on-chain proof
    const reasoningHash = keccak256(toBytes(signal.content[0].text));
    
    // 4. Build EIP-712 TradeIntent
    const intent: TradeIntent = {
      asset: WMON_ADDRESS,
      amount: agentConfig.positionSize,
      isBuy: parseBullish(signal),
      maxSlippage: 50, // 0.5%
      deadline: Math.floor(Date.now()/1000) + 30,
      reasoningHash,
      nonce: generateNonce(),
    };
    
    // 5. Sign and submit to RiskRouter (non-blocking)
    const sig = await agentWallet.signTypedData(intent);
    const tx = await riskRouter.executeWithIntent(intent, sig);
    
    // 6. Anchor signal on-chain
    await signalAnchor.anchor(agentId, reasoningHash, price);
    
    // 7. Wait for next block (~400ms)
    await sleep(400);
  }
}

// Launch all agents in parallel
await Promise.all(agents.map(a => agentLoop(a)));
```

---

## 10. Concrete Implementation Plan (6 Hours)

### Hour 1 (11:30 AM – 12:30 PM): Scaffold + Deploy Contracts

**Goal**: Core contracts deployed on testnet, faucet funded.

```
□ Fund wallet from faucet (faucet.monad.xyz + Alchemy)
□ Get testnet USDC (Circle faucet)
□ forge init parallel-mind
□ Write AgentRegistry.sol (ERC-721, simple)
□ Write SignalVault.sol (deposit/withdraw/allocate)
□ Write RiskRouter.sol (TradeIntent + EIP-712 + basic checks)
□ Write SignalAnchor.sol (event log of reasoning hashes)
□ forge deploy to chain 10143
□ Note all contract addresses
```

Key Foundry command:
```bash
forge create --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY --chain-id 10143 \
  src/SignalVault.sol:SignalVault
```

### Hour 2 (12:30 PM – 1:30 PM): Agent Core + Price Feed

**Goal**: Single agent fetching price + generating Claude signal.

```
□ npm init (TypeScript, viem, @anthropic-ai/sdk)
□ Connect to Pyth oracle (0x2880aB155794e7179c9eE2e38200202908C17B43)
□ Implement fetchPrice() with live MON/USD or ETH/USD feed
□ Implement generateSignal(price, strategy) → Claude Haiku call
□ Implement buildTradeIntent() + EIP-712 signing
□ Test single agent: price → signal → intent → contract call
□ Verify on Monadscan
```

### Hour 3 (1:30 PM – 2:30 PM): Multi-Agent Parallel Execution

**Goal**: 3 agents running concurrently, all submitting txns.

```
□ Define 3 strategy configs (momentum, mean reversion, arbitrage)
□ Create 3 separate agent wallets (fund each from faucet)
□ Wrap agentLoop() with Promise.all()
□ Verify parallel txns hit chain simultaneously (check block explorer)
□ Add basic error handling + retry on RPC rate limit
□ Log agent activity to console
```

### Hour 4 (2:30 PM – 3:30 PM): Frontend Dashboard

**Goal**: Live web UI showing agents in action — the demo centrepiece.

```
□ npx create-next-app dashboard
□ viem watchContractEvent → subscribe to SignalAnchor events
□ Display: Agent cards (name, strategy, last signal, P&L)
□ Live feed: trade intents as they arrive
□ Transaction links → Monadscan
□ "Launch All Agents" button
□ Show parallel execution visually (agents acting simultaneously)
```

### Hour 5 (3:30 PM – 4:30 PM): x402 + Polish

**Goal**: Add agent micropayment mechanic (the bonus "wow" feature).

```
□ Install @x402/next @x402/fetch @x402/evm@2.12.0
□ Create a "Signal API" endpoint: POST /api/signal (returns AI signal for $0.001 USDC)
□ Protect endpoint with x402 middleware
□ Agent 3 (arbitrage) calls Agent 1's signal API, pays x402 micropayment
□ Demo: agent-to-agent payment for intelligence, settled on Monad
□ Polish dashboard (show x402 payment events)
```

### Hour 6 (4:30 PM – 6:00 PM): Kuru DEX Integration + Pitch Prep

**Goal**: Actually execute swaps on Kuru, prepare pitch.

```
□ Integrate Kuru SDK for real DEX trades (replace mock)
□ Or: use 0x aggregator API for testnet swaps
□ End-to-end test: price pull → signal → trade intent → Kuru swap
□ Record 60-second screen capture as backup demo
□ Write 3-minute pitch script (see template below)
□ Update README.md with project description
□ Final deploy check — all contracts verified on Monadscan
```

### Minimal Viable Pivot (if behind schedule)

If full implementation falls behind, cut to:
1. AgentRegistry + SignalAnchor (2 contracts only)
2. 3 agents submitting signed reasoning hashes on-chain (no actual DEX trades)
3. Dashboard showing parallel agent submissions
4. Pitch: "proof of parallel AI cognition, anchored on-chain"

This is still novel and demo-able even without real trades.

---

## 11. Pitch Script Template (3 minutes)

**[0:00–0:20] Hook**
"Every crypto trading system today has one brain. One agent. Sequential decisions. I built something different: a multi-agent system where 3 specialized AI agents run in parallel, each with their own strategy, each making independent decisions — and Monad's parallel EVM executes them simultaneously. Not one after the other. At the same time."

**[0:20–0:50] The Problem**
"The problem with AI trading agents today: they're centralized. One LLM, one decision, no verification. You can't trust it. I solved this with two things: on-chain signal anchoring — every agent's reasoning is hashed and committed to Monad before executing — and multi-agent consensus. Agents have to agree before the vault moves capital."

**[0:50–2:00] Live Demo**
[Launch dashboard, show 3 agents activating]
"Watch: 3 agents — Momentum, Mean Reversion, and Arbitrage — each pulling live prices from Pyth oracle, generating signals via Claude, signing trade intents with EIP-712, and submitting to Monad. [Click 'Launch Agents'] You can see three transactions hitting the block explorer simultaneously. That's Monad's parallel execution — real physical parallelism. [Show Monadscan] Here's Agent 2 paying Agent 1 for its signal via x402 micropayment — $0.001 USDC, settled on-chain in 400 milliseconds."

**[2:00–2:40] Technical Innovation**
"Three things make this Monad-native: parallel execution means agents don't queue — they settle concurrently. On-chain signal anchoring means every AI decision is cryptographically verifiable. And x402 creates a real agent economy — agents buying and selling intelligence from each other."

**[2:40–3:00] Close**
"This is what AI × blockchain looks like when the chain is built for it. ParallelMind — 6 hours of code, built on Monad."

---

## Quick Reference Card

```
Chain ID:           10143
RPC:                https://testnet-rpc.monad.xyz
WebSocket:          wss://testnet-rpc.monad.xyz
Explorer:           https://testnet.monadscan.com
Faucet:             https://faucet.monad.xyz

WMON:               0xFb8bf4c1CC7a94c73D209a149eA2AbEa852BC541
USDC:               0x534b2f3A21130d7a60830c2Df862319e593943A3
Pyth:               0x2880aB155794e7179c9eE2e38200202908C17B43
Chainlink ETH/USD:  0x0c76859E85727683Eeba0C70Bc2e0F5781337818
Chainlink BTC/USD:  0x2Cd9D7E85494F68F5aF08EF96d6FD5e8F71B4d31
EntryPoint v0.7:    0x0000000071727De22E5E9d8BAf0edAc6f37da032
Permit2:            0x000000000022d473030f116ddee9f6b43ac78ba3
x402 USDC Proxy:    0x4020A4f3b7b90ccA423B9fabCc0CE57C6C240002
x402 Facilitator:   https://x402-facilitator.molandak.org

Block time:         400ms
Finality:           800ms
TPS:                10,000
EVM compatible:     Yes (full bytecode)
```
