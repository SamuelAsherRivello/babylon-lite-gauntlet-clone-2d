# Spec Delta

## Purpose
Provide the requested sprite-rendering behavior for a complete cooperative online dungeon game.

## ADDED Requirements

### Requirement: Original tile presentation
The game SHALL display original sprites for four heroes, four enemy types and dungeon tiles in a top-down 2D scene.

#### Scenario: Readability
- **WHEN** two players select the same character
- **THEN** both have matching class art and distinguishable color and numbered markers

### Requirement: Graphics recovery
The game SHALL fit desktop and narrow mobile screens and display an actionable message when graphics initialization fails.

#### Scenario: Unsupported browser
- **WHEN** WebGPU cannot initialize
- **THEN** a visible error explains browser requirements instead of a blank play area
