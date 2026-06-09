// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title SignalVault
/// @notice Shared treasury for the swarm. Depositors fund the vault with the
///         trading asset (USDC). The RiskRouter (or owner) allocates capital
///         across agents; allocation can never exceed the vault's real balance.
contract SignalVault is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable asset; // USDC

    mapping(address => uint256) public deposits; // depositor => amount
    mapping(uint256 => uint256) public agentAllocations; // agentId => allocated capital
    uint256 public totalDeposits;
    uint256 public totalAllocated;

    address public router; // RiskRouter allowed to move allocations

    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event Allocated(uint256 indexed agentId, uint256 amount);
    event Deallocated(uint256 indexed agentId, uint256 amount);
    event RouterSet(address indexed router);

    constructor(address _asset) Ownable(msg.sender) {
        require(_asset != address(0), "zero asset");
        asset = IERC20(_asset);
    }

    modifier onlyRouterOrOwner() {
        require(msg.sender == router || msg.sender == owner(), "not allowed");
        _;
    }

    function setRouter(address _router) external onlyOwner {
        router = _router;
        emit RouterSet(_router);
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "zero");
        asset.safeTransferFrom(msg.sender, address(this), amount);
        deposits[msg.sender] += amount;
        totalDeposits += amount;
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        require(deposits[msg.sender] >= amount, "insufficient deposit");
        // can't withdraw capital currently allocated to live agents
        require(asset.balanceOf(address(this)) - totalAllocated >= amount, "capital allocated");
        deposits[msg.sender] -= amount;
        totalDeposits -= amount;
        asset.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function allocate(uint256 agentId, uint256 amount) external onlyRouterOrOwner {
        require(totalAllocated + amount <= asset.balanceOf(address(this)), "over-allocate");
        agentAllocations[agentId] += amount;
        totalAllocated += amount;
        emit Allocated(agentId, amount);
    }

    function deallocate(uint256 agentId, uint256 amount) external onlyRouterOrOwner {
        require(agentAllocations[agentId] >= amount, "under-allocated");
        agentAllocations[agentId] -= amount;
        totalAllocated -= amount;
        emit Deallocated(agentId, amount);
    }

    function freeCapital() external view returns (uint256) {
        return asset.balanceOf(address(this)) - totalAllocated;
    }
}
