# dungeon-combat Specification

## Purpose
Provide the requested dungeon-combat behavior for a complete cooperative online dungeon game.

## Requirements

### Requirement: Complete dungeon
The game SHALL offer one traversable level containing Ghosts, Grunts, Demons and Sorcerers, four generators, food, treasure, two keys and an exit unlocked by keys and destroyed generators.

#### Scenario: Complete objective
- **WHEN** the party destroys all generators, collects two keys and enters the exit
- **THEN** all players see victory then a fresh playable round

### Requirement: Character switching
The game SHALL allow all four classes and duplicate choices while preserving player health, identity and attack cooldown.

#### Scenario: Switch class
- **WHEN** a player switches from Warrior to Wizard during combat
- **THEN** their abilities change but health and player color remain unchanged
