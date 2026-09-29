# Verification evidence

## Backend

The new `gauntlet-2d` simulation and integration suite passed locally, alongside drawing, sumo and garden regressions. Checks cover bounded inputs, stale input expiry, character switch invariants, unique colors, collision, objective reachability, pickups, projectile damage, locked exit, revival, defeat, victory, replay, late join, capacity 4/5, departure, fresh reconnect and game isolation.

Backend release v0.4.0 contains the game. The initial release and recovery deployment had live-test failures (an occupied Sumo room and later an alias/join failure); they were not treated as successful deployment. Concurrent backend work preserved this game in v0.5.0 and corrected canonical alias assignment. [Deployment 36611077569](https://github.com/SamuelAsherRivello/rmc-colyseus-multiplayer-server/actions/runs/36611077569) passed every game suite with Node 24. Public health then reported v0.5.0 with `gauntlet-2d` registered. Client package remains pinned to compatible v0.4.0.

## Browser and client

- `npm test`: three asset/input/dependency tests passed; all 15 128×128 RGBA sprite files are complete.
- `npm run build`: production build passed with the correct GitHub Pages repository base.
- `npx playwright test`: four tests passed in real Microsoft Edge with WebGPU, against the local Node 24 backend.
- Two independent browser contexts selected the same Wizard class with distinct cyan/amber player rings, numbers and roster entries. Movement synchronized. Local pause released held movement. Refresh rejoined with a fresh identity.
- A full dungeon run used real keyboard events, collected two keys, destroyed four generators and reached the exit. The second independent browser observed shared victory and automatic replay. No state injection, teleport or health cheat was used.
- A separate browser run allowed enemies to defeat the party, observed the defeat screen, and verified automatic recovery to a new round.
- 390×844 mobile layout: emulated simultaneous touch movement/attack passed; touch cancel released both inputs. Four character cards fit without scrolling to play. No horizontal overflow.
- WebGPU-unavailable context displayed the actionable graphics error. No page exceptions during two-client gameplay.
- Initial browser verification used agent-browser and confirmed connected state, WebGPU renderer and real game content. A screenshot exposed below-fold desktop controls; responsive sizing was corrected and screenshots refreshed.
- `screenshot.png`, `mobile.png`, `full-loop.png` and `defeat.png` are actual browser captures. The art target is separately labeled concept imagery.

Physical mobile hardware was not available. Public release verification is recorded below after deployment.

## Sources and art

OpenSpec 1.13.1 doctor and strict validation passed. Each major system has a separate explore/design record and apply task list. Imported skill revisions and preserved template copies are documented in provenance.md. Blender output was format-validated and visually inspected; the original editor scene was preserved.
