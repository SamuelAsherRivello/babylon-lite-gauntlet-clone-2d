# Design

## Context and exploration
Explored Blender MCP: version 5.2.2, fresh scene with three objects. Preserve existing scene; use dedicated scene and task collection with editable primitive characters. Orthographic camera renders transparent original sprite PNGs for 2D tile gameplay. Babylon Lite 1.25 provides WebGPU rendering; inspect package APIs before integration. Render miniatures as flat sprites, no 3D gameplay. Use dynamic color halos and numbered labels for duplicate classes.

## Goals / Non-Goals
Deliver the scoped behavior without accounts, durable storage or unrelated game changes.

## Decisions
Use the inspected template and shared lifecycle. Keep rules independent of rendering and use bounded inputs. The user requested explore then apply for each system; this exploration precedes its apply phase.

## Risks / Trade-offs
Hosting may reset sessions around five minutes; show reconnection and document in-memory progress. Browser verification distinguishes emulated touch from physical hardware.

## Migration Plan
Add isolated server game, test existing consumers, release backend, then publish pinned client. Use existing deployment rollback on failed live tests.
