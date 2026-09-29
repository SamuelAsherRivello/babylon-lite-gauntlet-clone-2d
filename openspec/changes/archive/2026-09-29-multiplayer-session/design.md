# Design

## Context and exploration
Inspected shared server: existing SumoRoom broadcasts gameState, MultiplayerClient supplies reconnect/snapshot and ordered seats. Add GauntletRoom at gauntlet-2d with four seats, 30Hz authoritative rules and 20Hz snapshots. Reuse client 0.2+ with no breaking API. Separate clone prevents modifying another active checkout.

## Goals / Non-Goals
Deliver the scoped behavior without accounts, durable storage or unrelated game changes.

## Decisions
Use the inspected template and shared lifecycle. Keep rules independent of rendering and use bounded inputs. The user requested explore then apply for each system; this exploration precedes its apply phase.

## Risks / Trade-offs
Hosting may reset sessions around five minutes; show reconnection and document in-memory progress. Browser verification distinguishes emulated touch from physical hardware.

## Migration Plan
Add isolated server game, test existing consumers, release backend, then publish pinned client. Use existing deployment rollback on failed live tests.
