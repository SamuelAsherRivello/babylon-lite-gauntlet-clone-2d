# Spec Delta

## Purpose
Provide the requested multiplayer-session behavior for a complete cooperative online dungeon game.

## ADDED Requirements

### Requirement: Hot join and capacity
The service SHALL admit one through four players into the same dungeon, reject a fifth with full status, synchronize late joiners and remove departed players.

#### Scenario: Two clients join
- **WHEN** two independent clients connect
- **THEN** both see the same dungeon and distinct player colors and numbers

### Requirement: Safe authority
The service SHALL reject invalid movement, unknown classes and client-supplied health or scores, and isolate other games.

#### Scenario: Invalid action
- **WHEN** a client sends out-of-range input or another player identity
- **THEN** no unauthorized state changes occur
