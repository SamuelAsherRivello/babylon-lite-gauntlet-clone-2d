# Proposal

## Why
Deliver the requested playable cooperative dungeon experience with a independently verifiable multiplayer-session system.

## What Changes
- Isolated four-seat gauntlet-2d room using the existing shared client lifecycle; server-authoritative input, presence, unique colors, hot join/drop, late snapshots, capacity rejection and fresh reconnect. Preserve drawing and sumo protocols. Release and verify backend before client implementation.

## Capabilities
### New Capabilities
- multiplayer-session: Isolated four-seat gauntlet-2d room using the existing shared client lifecycle; server-authoritative input, presence, unique colors, hot join/drop, late snapshots, capacity rejection and fresh reconnect. Preserve drawing and sumo protocols. Release and verify backend before client implementation.
### Modified Capabilities
None.

## Impact
Game application and tests under project-name; multiplayer and combat also extend sibling gauntlet-2d-server. Existing consumers remain compatible.
