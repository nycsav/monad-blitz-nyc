import { privateKeyToAccount } from 'viem/accounts';
import { addresses, publicClient, walletFor } from './config.js';
import { agentRegistryAbi } from './abis.js';
import { STRATEGIES, pkFor } from './strategies.js';

/**
 * Register all three agent wallets on-chain. The deployer (operator) mints one
 * AgentRegistry NFT per agent, binding each strategy to its autonomous signing
 * wallet. Run once after deploy:  npm run register
 */
async function main() {
  if (!addresses.agentRegistry) throw new Error('AGENT_REGISTRY not set in .env — deploy contracts first');
  const deployerPk = process.env.DEPLOYER_PRIVATE_KEY;
  if (!deployerPk) throw new Error('DEPLOYER_PRIVATE_KEY not set in agents/.env');

  const { wallet } = walletFor(deployerPk);
  console.log(`\n📇 Registering ${STRATEGIES.length} agents on AgentRegistry ${addresses.agentRegistry}\n`);

  for (const cfg of STRATEGIES) {
    const agentAddr = privateKeyToAccount(pkFor(cfg) as `0x${string}`).address;

    const existing = (await publicClient.readContract({
      address: addresses.agentRegistry,
      abi: agentRegistryAbi,
      functionName: 'walletToAgentId',
      args: [agentAddr],
    })) as bigint;

    if (existing > 0n) {
      console.log(`  ${cfg.name.padEnd(14)} already registered → agent ${existing}`);
      continue;
    }

    const hash = await wallet.writeContract({
      address: addresses.agentRegistry,
      abi: agentRegistryAbi,
      functionName: 'registerAgent',
      args: [agentAddr, cfg.strategy],
    });
    await publicClient.waitForTransactionReceipt({ hash });

    const id = (await publicClient.readContract({
      address: addresses.agentRegistry,
      abi: agentRegistryAbi,
      functionName: 'walletToAgentId',
      args: [agentAddr],
    })) as bigint;

    console.log(`  ${cfg.name.padEnd(14)} ${agentAddr} → agent ${id}   tx ${hash.slice(0, 14)}…`);
  }

  const total = (await publicClient.readContract({
    address: addresses.agentRegistry,
    abi: agentRegistryAbi,
    functionName: 'totalAgents',
  })) as bigint;
  console.log(`\n  total agents registered: ${total}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
