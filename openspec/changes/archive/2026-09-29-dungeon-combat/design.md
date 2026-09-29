# Design

## Context and exploration
Explored classic gameplay and server update model: deterministic tile collision, projectile combat, destructible enemy generators, shared keys and gated exit provide a bounded complete level. Prefer server simulation over client relay to avoid divergent damage. Classes differ in speed/damage/attack interval; switching never heals. Four generators spawn four distinct enemy types with capped population. Dead players revive near living allies; all dead triggers defeat. Shared victory/defeat automatically replays after ten seconds.

## Goals / Non-Goals
Deliver the scoped behavior without accounts, durable storage or unrelated game changes.

## Decisions
Use the inspected template and shared lifecycle. Keep rules independent of rendering and use bounded inputs. The user requested explore then apply for each system; this exploration precedes its apply phase.

## Risks / Trade-offs
Hosting may reset sessions around five minutes; show reconnection and document in-memory progress. Browser verification distinguishes emulated touch from physical hardware.

## Migration Plan
Add isolated server game, test existing consumers, release backend, then publish pinned client. Use existing deployment rollback on failed live tests.
