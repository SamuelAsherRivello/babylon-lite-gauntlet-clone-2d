# Design

## Context and exploration
Explored template four corners and shared status API. Preserve title/links/settings/version roles; use portrait game panel and side party/field guide on desktop, compact stacked header on mobile. Four class buttons remain outside gameplay. Keyboard WASD/arrows with auto-aim attack and pointer aim; touch joystick and attack can run concurrently. Local pause releases input while server continues. No player may reset a live shared run. Victory/defeat replay automatically.

## Goals / Non-Goals
Deliver the scoped behavior without accounts, durable storage or unrelated game changes.

## Decisions
Use the inspected template and shared lifecycle. Keep rules independent of rendering and use bounded inputs. The user requested explore then apply for each system; this exploration precedes its apply phase.

## Risks / Trade-offs
Hosting may reset sessions around five minutes; show reconnection and document in-memory progress. Browser verification distinguishes emulated touch from physical hardware.

## Migration Plan
Add isolated server game, test existing consumers, release backend, then publish pinned client. Use existing deployment rollback on failed live tests.
