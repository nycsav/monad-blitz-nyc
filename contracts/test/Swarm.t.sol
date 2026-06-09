// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {SignalAnchor} from "../src/SignalAnchor.sol";
import {RiskRouter} from "../src/RiskRouter.sol";

/// @notice End-to-end smoke test of the agent signing -> router -> anchor flow.
contract SwarmTest is Test {
    AgentRegistry registry;
    SignalAnchor anchor;
    RiskRouter router;

    uint256 agentPk = 0xA11CE;
    address agentWallet;

    function setUp() public {
        agentWallet = vm.addr(agentPk);

        registry = new AgentRegistry();
        anchor = new SignalAnchor(address(registry));
        router = new RiskRouter(address(registry), address(anchor));

        // anchor + router may update reputation
        registry.setAuthorized(address(anchor), true);
        registry.setAuthorized(address(router), true);

        // register the agent NFT (operator is an EOA), binding the signing wallet
        vm.prank(makeAddr("operator"));
        registry.registerAgent(agentWallet, "momentum");
    }

    function _sign(RiskRouter.TradeIntent memory intent) internal view returns (bytes memory) {
        bytes32 digest = router.hashIntent(intent);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(agentPk, digest);
        return abi.encodePacked(r, s, v);
    }

    function _intent(uint256 nonce) internal view returns (RiskRouter.TradeIntent memory) {
        return RiskRouter.TradeIntent({
            agentId: 1,
            asset: address(0xBEEF),
            amount: 1_000e6,
            isBuy: true,
            maxSlippageBps: 50,
            deadline: block.timestamp + 30,
            reasoningHash: keccak256("MON momentum breaking out above 20MA, bullish"),
            price: 2_15000000, // $2.15 scaled 1e8
            direction: int8(1),
            nonce: nonce
        });
    }

    function test_ExecuteIntent_AnchorsAndCounts() public {
        RiskRouter.TradeIntent memory intent = _intent(1);
        bytes memory sig = _sign(intent);

        uint256 signalId = router.executeIntent(intent, sig);
        assertEq(signalId, 0, "first signal id");
        assertEq(anchor.totalSignals(), 1, "one signal anchored");
        assertEq(anchor.agentSignalCount(1), 1, "agent signal counted");

        AgentRegistry.Agent memory a = registry.getAgent(1);
        assertEq(a.totalSignals, 1, "reputation signal count");
        assertEq(a.totalTrades, 1, "reputation trade count");
    }

    function test_RevertOnReplay() public {
        RiskRouter.TradeIntent memory intent = _intent(1);
        bytes memory sig = _sign(intent);
        router.executeIntent(intent, sig);

        vm.expectRevert(bytes("nonce used"));
        router.executeIntent(intent, sig);
    }

    function test_RevertOnBadSigner() public {
        RiskRouter.TradeIntent memory intent = _intent(2);
        // sign with the wrong key
        bytes32 digest = router.hashIntent(intent);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(0xBADBAD, digest);
        bytes memory sig = abi.encodePacked(r, s, v);

        vm.expectRevert(bytes("bad agent signature"));
        router.executeIntent(intent, sig);
    }

    function test_VerifyReasoning() public {
        RiskRouter.TradeIntent memory intent = _intent(3);
        intent.reasoningHash = keccak256(bytes("reveal me"));
        bytes memory sig = _sign(intent);
        uint256 signalId = router.executeIntent(intent, sig);

        assertTrue(anchor.verifyReasoning(signalId, "reveal me"), "reasoning verifies");
        assertFalse(anchor.verifyReasoning(signalId, "wrong"), "wrong reasoning fails");
    }
}
