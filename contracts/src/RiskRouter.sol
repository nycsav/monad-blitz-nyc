// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IAgentRegistry {
    function agentWalletOf(uint256 agentId) external view returns (address);
    function recordTrade(uint256 agentId, int256 pnlDelta) external;
}

interface ISignalAnchor {
    function anchor(uint256 agentId, bytes32 reasoningHash, int256 price, int8 direction)
        external
        returns (uint256);
}

/// @title RiskRouter
/// @notice The safety layer. Every agent trade arrives as an EIP-712-signed
///         TradeIntent. The router verifies the signature was produced by the
///         agent's registered signing wallet, enforces replay protection,
///         deadline, position and slippage caps — and only then anchors the
///         reasoning on-chain and records the trade. The `reasoningHash` binds
///         the AI's cognition to the on-chain action.
contract RiskRouter is EIP712, Ownable {
    using ECDSA for bytes32;

    struct TradeIntent {
        uint256 agentId;
        address asset;
        uint256 amount;
        bool isBuy;
        uint256 maxSlippageBps;
        uint256 deadline;
        bytes32 reasoningHash;
        int256 price;
        int8 direction;
        uint256 nonce;
    }

    bytes32 public constant TRADE_INTENT_TYPEHASH = keccak256(
        "TradeIntent(uint256 agentId,address asset,uint256 amount,bool isBuy,uint256 maxSlippageBps,uint256 deadline,bytes32 reasoningHash,int256 price,int8 direction,uint256 nonce)"
    );

    IAgentRegistry public immutable registry;
    ISignalAnchor public immutable anchorContract;

    mapping(uint256 => mapping(uint256 => bool)) public usedNonce; // agentId => nonce => used
    uint256 public maxPositionSize = type(uint256).max; // per-trade cap
    uint256 public maxSlippageBpsCap = 1000; // 10%

    event TradeExecuted(
        uint256 indexed agentId,
        uint256 indexed signalId,
        address asset,
        uint256 amount,
        bool isBuy,
        bytes32 reasoningHash,
        uint256 nonce
    );

    constructor(address _registry, address _anchor) EIP712("MonadSwarm", "1") Ownable(msg.sender) {
        registry = IAgentRegistry(_registry);
        anchorContract = ISignalAnchor(_anchor);
    }

    function setMaxPositionSize(uint256 v) external onlyOwner {
        maxPositionSize = v;
    }

    function setMaxSlippageBpsCap(uint256 v) external onlyOwner {
        maxSlippageBpsCap = v;
    }

    /// @notice EIP-712 digest for a TradeIntent (agents sign this off-chain).
    function hashIntent(TradeIntent calldata intent) public view returns (bytes32) {
        return _hashTypedDataV4(
            keccak256(
                abi.encode(
                    TRADE_INTENT_TYPEHASH,
                    intent.agentId,
                    intent.asset,
                    intent.amount,
                    intent.isBuy,
                    intent.maxSlippageBps,
                    intent.deadline,
                    intent.reasoningHash,
                    intent.price,
                    intent.direction,
                    intent.nonce
                )
            )
        );
    }

    /// @notice Validate a signed intent, anchor the reasoning, record the trade.
    function executeIntent(TradeIntent calldata intent, bytes calldata signature)
        external
        returns (uint256 signalId)
    {
        require(block.timestamp <= intent.deadline, "intent expired");
        require(!usedNonce[intent.agentId][intent.nonce], "nonce used");
        require(intent.amount <= maxPositionSize, "position too large");
        require(intent.maxSlippageBps <= maxSlippageBpsCap, "slippage too high");

        // Recover signer and require it matches the registered agent wallet.
        address signer = hashIntent(intent).recover(signature);
        address expected = registry.agentWalletOf(intent.agentId);
        require(signer != address(0) && signer == expected, "bad agent signature");

        usedNonce[intent.agentId][intent.nonce] = true;

        // Proof of cognition: commit the reasoning hash + price snapshot on-chain.
        signalId = anchorContract.anchor(intent.agentId, intent.reasoningHash, intent.price, intent.direction);

        // Reputation: count the trade (PnL settled separately). Best-effort.
        try registry.recordTrade(intent.agentId, int256(0)) {} catch {}

        emit TradeExecuted(
            intent.agentId, signalId, intent.asset, intent.amount, intent.isBuy, intent.reasoningHash, intent.nonce
        );
    }
}
