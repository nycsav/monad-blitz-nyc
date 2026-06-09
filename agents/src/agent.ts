import { recoverTypedDataAddress } from 'viem';
import { addresses, publicClient, walletFor } from './config.js';
import { fetchPriceByName } from './pyth.js';
import { generateSignal, mockSignal, hasApiKey, type Signal } from './claude.js';
import { domain, reasoningHash, tradeIntentTypes, type TradeIntent } from './intent.js';
import { riskRouterAbi } from './abis.js';
import { pkFor, type StrategyConfig } from './strategies.js';

export interface CycleResult {
  cfg: StrategyConfig;
  price: number;
  signal: Signal;
  intent: TradeIntent;
  signature: `0x${string}`;
  signerOk: boolean;
  txHash?: `0x${string}`;
  signalId?: bigint;
  mocked: boolean;
}

const dirNum = (d: Signal['direction']) => (d === 'bull' ? 1 : d === 'bear' ? -1 : 0);

let warnedNoRouter = false;
function warnNoRouterOnce() {
  if (warnedNoRouter) return;
  warnedNoRouter = true;
  console.warn('  ⚠ RISK_ROUTER not set — signing against 0x0 (deploy contracts to go live)\n');
}

/**
 * One full agent cycle: pull price -> Claude signal -> build & sign EIP-712
 * TradeIntent -> verify signer locally -> (optionally) submit to RiskRouter.
 */
export async function runCycle(cfg: StrategyConfig, opts: { live: boolean } = { live: false }): Promise<CycleResult> {
  const { account, wallet } = walletFor(pkFor(cfg));

  // 1. Live price (pull oracle)
  const quote = await fetchPriceByName(cfg.asset);

  // 2. AI signal (real Claude if a key is present; deterministic mock otherwise)
  const mocked = !hasApiKey();
  const signal = mocked
    ? mockSignal({ strategy: cfg.strategy, asset: cfg.asset, price: quote.price })
    : await generateSignal({ strategy: cfg.strategy, asset: cfg.asset, price: quote.price });

  // 3. Build the EIP-712 TradeIntent
  const direction = dirNum(signal.direction);
  const intent: TradeIntent = {
    agentId: cfg.agentId,
    asset: addresses.wmon,
    amount: BigInt(Math.round(cfg.positionUsd * (signal.positionPct / 100) * 1e6)), // USDC 6dp
    isBuy: direction >= 0,
    maxSlippageBps: 50n,
    deadline: BigInt(Math.floor(Date.now() / 1000) + 60),
    reasoningHash: reasoningHash(signal.reasoning),
    price: quote.raw,
    direction,
    nonce: BigInt(Date.now()),
  };

  // 4. Sign it with the agent's autonomous key. Pre-deploy, sign against the
  // zero address so the pipeline is still demonstrable (warned once globally).
  if (!addresses.riskRouter) warnNoRouterOnce();
  const verifyingContract = addresses.riskRouter ?? '0x0000000000000000000000000000000000000000';
  const signature = await wallet.signTypedData({
    account,
    domain: domain(verifyingContract),
    types: tradeIntentTypes,
    primaryType: 'TradeIntent',
    message: intent,
  });

  // 5. Recover the signer locally — exactly what RiskRouter.executeIntent does on-chain
  const recovered = await recoverTypedDataAddress({
    domain: domain(verifyingContract),
    types: tradeIntentTypes,
    primaryType: 'TradeIntent',
    message: intent,
    signature,
  });
  const signerOk = recovered.toLowerCase() === account.address.toLowerCase();

  const result: CycleResult = { cfg, price: quote.price, signal, intent, signature, signerOk, mocked };

  // 6. Submit on-chain (only when explicitly live and deployed)
  if (opts.live && addresses.riskRouter) {
    const txHash = await wallet.writeContract({
      address: addresses.riskRouter,
      abi: riskRouterAbi,
      functionName: 'executeIntent',
      args: [intent, signature],
    });
    result.txHash = txHash;
    await publicClient.waitForTransactionReceipt({ hash: txHash });
  }

  return result;
}
