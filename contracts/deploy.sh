#!/usr/bin/env bash
# Deploy MonadSwarm to Monad Testnet (chain 10143) and broadcast.
#
# Two modes (keystore is preferred — never puts a raw key on disk/CLI):
#   keystore:  DEPLOYER_ACCOUNT=<cast-wallet-name> [DEPLOYER_SENDER=0x..] ./deploy.sh
#              (prompts for the keystore password)
#   raw key:   PRIVATE_KEY=0x... ./deploy.sh   (from .env; throwaway testnet keys only)
set -euo pipefail
cd "$(dirname "$0")"
set -a; . ./.env 2>/dev/null || true; set +a

RPC="${MONAD_TESTNET_RPC:-https://testnet-rpc.monad.xyz}"

if [ -n "${DEPLOYER_ACCOUNT:-}" ]; then
  echo "▸ deploying with encrypted keystore account: $DEPLOYER_ACCOUNT"
  forge script script/Deploy.s.sol:Deploy \
    --rpc-url "$RPC" \
    --account "$DEPLOYER_ACCOUNT" \
    ${DEPLOYER_SENDER:+--sender "$DEPLOYER_SENDER"} \
    --broadcast --slow -vvv
elif [ -n "${PRIVATE_KEY:-}" ]; then
  echo "▸ deploying with raw PRIVATE_KEY from .env"
  forge script script/Deploy.s.sol:Deploy \
    --rpc-url "$RPC" \
    --private-key "$PRIVATE_KEY" \
    --broadcast --slow -vvv
else
  echo "✗ No DEPLOYER_ACCOUNT or PRIVATE_KEY set." >&2
  echo "  keystore:  DEPLOYER_ACCOUNT=monad-deployer ./deploy.sh" >&2
  echo "  raw key:   set PRIVATE_KEY in contracts/.env" >&2
  exit 1
fi
