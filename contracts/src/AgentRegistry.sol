// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title AgentRegistry
/// @notice Each MonadSwarm AI agent is minted as an NFT. The NFT owner is the
///         human operator; a separate `agentWallet` is the AI's autonomous
///         signing key used to sign EIP-712 TradeIntents. Reputation (PnL,
///         trade/signal counts) accrues on-chain per agent.
contract AgentRegistry is ERC721, Ownable {
    struct Agent {
        address operator; // human owner (== ownerOf(agentId))
        address agentWallet; // AI signing key (autonomous)
        string strategy; // "momentum" | "mean_reversion" | "arbitrage"
        uint64 registeredAt;
        int256 cumulativePnL; // realized PnL, scaled by asset decimals
        uint64 totalSignals;
        uint64 totalTrades;
    }

    uint256 public nextAgentId = 1;
    mapping(uint256 => Agent) public agents;
    mapping(address => uint256) public walletToAgentId; // agentWallet => agentId

    /// @notice Contracts allowed to mutate reputation (SignalAnchor, RiskRouter).
    mapping(address => bool) public authorized;

    event AgentRegistered(
        uint256 indexed agentId, address indexed operator, address indexed agentWallet, string strategy
    );
    event SignalCounted(uint256 indexed agentId, uint64 totalSignals);
    event ReputationUpdated(uint256 indexed agentId, int256 cumulativePnL, uint64 totalTrades);

    constructor() ERC721("MonadSwarm Agent", "SWARM") Ownable(msg.sender) {}

    modifier onlyAuthorized() {
        require(authorized[msg.sender] || msg.sender == owner(), "not authorized");
        _;
    }

    function setAuthorized(address who, bool ok) external onlyOwner {
        authorized[who] = ok;
    }

    /// @notice Mint a new agent NFT. Caller becomes the operator/owner.
    function registerAgent(address agentWallet, string calldata strategy) external returns (uint256 agentId) {
        require(agentWallet != address(0), "zero wallet");
        require(walletToAgentId[agentWallet] == 0, "wallet already used");

        agentId = nextAgentId++;
        agents[agentId] = Agent({
            operator: msg.sender,
            agentWallet: agentWallet,
            strategy: strategy,
            registeredAt: uint64(block.timestamp),
            cumulativePnL: 0,
            totalSignals: 0,
            totalTrades: 0
        });
        walletToAgentId[agentWallet] = agentId;
        _safeMint(msg.sender, agentId);
        emit AgentRegistered(agentId, msg.sender, agentWallet, strategy);
    }

    function agentWalletOf(uint256 agentId) external view returns (address) {
        return agents[agentId].agentWallet;
    }

    function getAgent(uint256 agentId) external view returns (Agent memory) {
        return agents[agentId];
    }

    function totalAgents() external view returns (uint256) {
        return nextAgentId - 1;
    }

    /// @notice Increment a signal count (called by SignalAnchor).
    function recordSignal(uint256 agentId) external onlyAuthorized {
        Agent storage a = agents[agentId];
        a.totalSignals++;
        emit SignalCounted(agentId, a.totalSignals);
    }

    /// @notice Record a settled trade + PnL delta (called by RiskRouter).
    function recordTrade(uint256 agentId, int256 pnlDelta) external onlyAuthorized {
        Agent storage a = agents[agentId];
        a.totalTrades++;
        a.cumulativePnL += pnlDelta;
        emit ReputationUpdated(agentId, a.cumulativePnL, a.totalTrades);
    }
}
