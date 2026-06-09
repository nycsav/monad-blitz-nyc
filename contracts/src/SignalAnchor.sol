// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IReputation {
    function recordSignal(uint256 agentId) external;
}

/// @title SignalAnchor
/// @notice The "proof of cognition" layer. Every AI signal is committed
///         on-chain as a keccak256 hash of the agent's full reasoning text,
///         bound to the oracle price at signal time. This makes each agent
///         decision cryptographically verifiable and tamper-evident — you can
///         later reveal the reasoning and prove it produced the on-chain hash.
contract SignalAnchor {
    struct SignalRecord {
        uint256 agentId;
        bytes32 reasoningHash; // keccak256 of the agent's full reasoning string
        int256 price; // oracle price snapshot at signal time
        int8 direction; // +1 bull, -1 bear, 0 neutral
        uint64 timestamp;
        uint256 blockNumber;
    }

    SignalRecord[] public signals;
    mapping(uint256 => uint256[]) public agentSignalIds; // agentId => signal indices

    address public registry; // AgentRegistry (optional reputation hook)

    event SignalAnchored(
        uint256 indexed signalId,
        uint256 indexed agentId,
        bytes32 reasoningHash,
        int256 price,
        int8 direction,
        uint64 timestamp
    );

    constructor(address _registry) {
        registry = _registry;
    }

    /// @notice Anchor an AI reasoning hash on-chain.
    function anchor(uint256 agentId, bytes32 reasoningHash, int256 price, int8 direction)
        external
        returns (uint256 signalId)
    {
        signalId = signals.length;
        signals.push(
            SignalRecord({
                agentId: agentId,
                reasoningHash: reasoningHash,
                price: price,
                direction: direction,
                timestamp: uint64(block.timestamp),
                blockNumber: block.number
            })
        );
        agentSignalIds[agentId].push(signalId);
        emit SignalAnchored(signalId, agentId, reasoningHash, price, direction, uint64(block.timestamp));

        // Best-effort reputation counting; never let it block an anchor.
        if (registry != address(0)) {
            try IReputation(registry).recordSignal(agentId) {} catch {}
        }
    }

    function totalSignals() external view returns (uint256) {
        return signals.length;
    }

    function agentSignalCount(uint256 agentId) external view returns (uint256) {
        return agentSignalIds[agentId].length;
    }

    function getSignal(uint256 signalId) external view returns (SignalRecord memory) {
        return signals[signalId];
    }

    /// @notice Verify a previously-anchored signal matches a revealed reasoning string.
    function verifyReasoning(uint256 signalId, string calldata reasoning) external view returns (bool) {
        return keccak256(bytes(reasoning)) == signals[signalId].reasoningHash;
    }
}
