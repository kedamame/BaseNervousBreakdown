// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MemoryGame
 * @notice Records scores (stage + moves) for the BaseNervousBreakdown memory card game.
 * @dev Deploy on Base Mainnet. Call recordGame() after each stage clear.
 *
 * Security notes:
 * - Scores are client-reported and not cryptographically verified on-chain.
 *   The contract provides basic sanity checks (stage bounds, move minimums,
 *   rate limiting) to deter trivial abuse, but is not fully trustless.
 * - For production use, consider adding off-chain signature verification
 *   (backend signs a completion proof that the contract verifies).
 */
contract MemoryGame {
    struct GameRecord {
        uint32 stage;
        uint32 moves;
        uint64 timestamp;
    }

    // Maximum allowed stage number
    uint32 public constant MAX_STAGE = 20;

    // Minimum seconds between successive recordGame() calls from the same address
    uint256 public constant RECORD_COOLDOWN = 30;

    // Minimum moves for a stage (prevents 0 or 1 move exploit)
    uint32 public constant MIN_MOVES = 2;

    mapping(address => GameRecord[]) private _records;
    mapping(address => uint32) public highestStage;
    mapping(address => uint256) private _lastRecordTime;

    event GameCompleted(
        address indexed player,
        uint32 stage,
        uint32 moves,
        uint64 timestamp
    );

    /**
     * @notice Record a completed stage.
     * @param stage  The stage number cleared (1..MAX_STAGE).
     * @param moves  Number of move attempts made (must be >= stage pairsNeeded).
     */
    function recordGame(uint32 stage, uint32 moves) external {
        require(stage >= 1 && stage <= MAX_STAGE, "Stage out of range");
        // Minimum possible moves == number of pairs needed to complete the stage
        uint32 minPossibleMoves = _pairsForStage(stage);
        require(moves >= minPossibleMoves, "Moves below theoretical minimum");
        // Rate limit: one record per cooldown period
        require(
            block.timestamp >= _lastRecordTime[msg.sender] + RECORD_COOLDOWN,
            "Record cooldown active"
        );

        uint64 ts = uint64(block.timestamp);
        _records[msg.sender].push(
            GameRecord({ stage: stage, moves: moves, timestamp: ts })
        );
        _lastRecordTime[msg.sender] = block.timestamp;

        if (stage > highestStage[msg.sender]) {
            highestStage[msg.sender] = stage;
        }

        emit GameCompleted(msg.sender, stage, moves, ts);
    }

    /**
     * @notice Get all game records for a player.
     */
    function getRecords(address player)
        external
        view
        returns (GameRecord[] memory)
    {
        return _records[player];
    }

    /**
     * @notice Get the highest stage reached by a player.
     */
    function getHighestStage(address player) external view returns (uint32) {
        return highestStage[player];
    }

    /**
     * @notice Get the number of games recorded for a player.
     */
    function getRecordCount(address player) external view returns (uint256) {
        return _records[player].length;
    }

    /**
     * @dev Returns the minimum number of moves (= pairs) for a given stage.
     *      Mirrors the client-side getCardCount() / 2 = stage * 2 logic.
     *      Stage 1: 2 pairs, Stage 2: 4 pairs, Stage 3: 6 pairs, etc.
     *      NOTE: Requires redeployment after client-side getCardCount change.
     */
    function _pairsForStage(uint32 stage) internal pure returns (uint32) {
        return stage * 2;
    }
}
