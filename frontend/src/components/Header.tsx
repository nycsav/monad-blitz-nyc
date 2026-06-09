import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
import { monadTestnet } from '../lib/chain';
import { truncateHash } from '../lib/format';

function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <button className="btn" onClick={() => disconnect()} title={address}>
        <span className="mono">{truncateHash(address, 4, 4)}</span> · Disconnect
      </button>
    );
  }

  const injectedConnector = connectors.find((c) => c.type === 'injected') ?? connectors[0];

  return (
    <button
      className="btn primary"
      disabled={isPending || !injectedConnector}
      onClick={() => injectedConnector && connect({ connector: injectedConnector })}
    >
      {isPending ? 'Connecting…' : 'Connect Wallet'}
    </button>
  );
}

function ChainChip() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const onMonad = chainId === monadTestnet.id;

  if (!isConnected) {
    return (
      <span className="chip">
        <span className="led" />
        {monadTestnet.name}
      </span>
    );
  }

  return (
    <span className={`chip ${onMonad ? 'ok' : 'warn'}`}>
      <span className="led" />
      {onMonad ? monadTestnet.name : `Wrong network (${chainId})`}
      <span style={{ opacity: 0.6 }}>· {chainId}</span>
    </span>
  );
}

export function Header() {
  return (
    <header className="header">
      <div className="brand">
        <h1>
          Monad<span className="dot">Swarm</span>
        </h1>
        <span className="tag">parallel agents on a parallel chain</span>
      </div>
      <div className="header-right">
        <ChainChip />
        <WalletButton />
      </div>
    </header>
  );
}
