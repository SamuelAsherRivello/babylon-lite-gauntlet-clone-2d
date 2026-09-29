# player-interface Specification

## Purpose
Provide the requested player-interface behavior for a complete cooperative online dungeon game.

## Requirements

### Requirement: Accessible controls
Players SHALL hot join, instantly switch with four visible buttons, move and attack with keyboard or concurrent touch, and see health, objectives, party and connection status.

#### Scenario: Input release
- **WHEN** focus is lost, local pause starts or a pointer is canceled
- **THEN** local held movement and attack stop

### Requirement: Published recovery
The public game SHALL provide full-room retry, connection recovery, instructions and correct version with functioning repository-subpath assets.

#### Scenario: Published play
- **WHEN** two independent browsers open the public URL
- **THEN** both can join, move, switch and observe shared state
