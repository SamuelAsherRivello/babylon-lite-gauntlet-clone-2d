# Source and artwork provenance

- Game repository created using GitHub template generation from `SamuelAsherRivello/github-repository-template`, revision `497d9e911cfcb04c9d20134ae3001a75d8a8ac15` (main).
- Shared skills imported as real project files from `SamuelAsherRivello/ai-skills-library`, revision `98b9db463c68f296fcc63b3ff67688b4f6eb1300` (master).
- Blender Codex skills imported from `.codex/skills` in `SamuelAsherRivello/ai-skills-blender`, revision `20be7f9e3186f10dc9e51b360192bbd15db320c7` (main), into this project's `.agents/skills` discovery directory.
- Original overlapping template skills preserved in `documentation/template-skills`; user-requested shared-library copies take precedence. No generated skill source was hand-edited. OpenSpec CLI 1.13.1; doctor and strict validation passed. Reopening Codex may be needed to index imported autocomplete.

## Art

All runtime PNGs in `public/art` are original models rendered in Blender 5.2.2 LTS through the official Blender MCP. Source: `art-source/create_sprites.py` and editable `art-source/embervault-sprites.blend`. The original user scene was preserved. Each asset uses 128×128 RGBA, an elevated orthographic camera, Eevee, warm key and cool fill light, and simple faceted geometry. Artwork is displayed as 2D sprites in a tile-based game.

The generated image in `documentation/art-target/target-01` is a concept reference, not a Blender render or game screenshot. Its broad weapon/hat/hood silhouettes and palette informed models. Actual rendered hero/enemy sprites were inspected against that fixed target. Small costume details were intentionally omitted for readability. The camera is steeper than the concept for overhead gameplay. Runtime assets contain no extracted original Gauntlet artwork.

The 1985 Gauntlet and Slayer Edition references inform cooperative dungeon gameplay, four class archetypes and four enemy archetypes. This is an unofficial fan-inspired portfolio game; original game names and trademarks belong to their owners.

## Template decisions

GitHub template generation takes precedence over contradictory older checklist instructions for manual repository creation. Application directory `project-name` is deliberately preserved as required by AGENTS.md. React is unnecessary for this small canvas game; the application uses native DOM controls and Babylon Lite. Corner title, links, settings and version roles are retained. The initial template commit is preserved without rewriting history.
