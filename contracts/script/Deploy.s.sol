// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {SignalAnchor} from "../src/SignalAnchor.sol";
import {SignalVault} from "../src/SignalVault.sol";
import {RiskRouter} from "../src/RiskRouter.sol";

/// @notice Deploys the full MonadSwarm contract suite to Monad Testnet and
///         wires up authorizations. Run with:
///
///   forge script script/Deploy.s.sol:Deploy \
///     --rpc-url monad_testnet --broadcast --private-key $PRIVATE_KEY
contract Deploy is Script {
    // Circle native USDC on Monad testnet (from RESEARCH.md).
    address constant USDC = 0x534b2f3A21130d7a60830c2Df862319e593943A3;

    function run() external {
        // Allow overriding the trading asset via env; default to canonical USDC.
        address asset = vm.envOr("VAULT_ASSET", USDC);

        vm.startBroadcast();

        AgentRegistry registry = new AgentRegistry();
        SignalAnchor anchor = new SignalAnchor(address(registry));
        SignalVault vault = new SignalVault(asset);
        RiskRouter router = new RiskRouter(address(registry), address(anchor));

        // Wire authorizations so the anchor/router can update reputation,
        // and the router can move vault allocations.
        registry.setAuthorized(address(anchor), true);
        registry.setAuthorized(address(router), true);
        vault.setRouter(address(router));

        vm.stopBroadcast();

        console2.log("=== MonadSwarm deployed (chain 10143) ===");
        console2.log("AgentRegistry :", address(registry));
        console2.log("SignalAnchor  :", address(anchor));
        console2.log("SignalVault   :", address(vault));
        console2.log("RiskRouter    :", address(router));
        console2.log("VaultAsset    :", asset);
    }
}
