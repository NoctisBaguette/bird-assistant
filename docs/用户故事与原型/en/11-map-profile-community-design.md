# Map, avatar and community review v0.11

30 October 2026, Asia/Shanghai. [Chinese team copy](../10-map-profile-community-design.md). This is a browser frontend checkpoint. Native WeChat development has not begun; maps, identity and public activity remain demonstrations.

## Repository and update workflow

At the native-development stage, the user plans a separate `NoctisBaguette/bird-assistant-miniprogram` repository with complete project code and history. This revision does not create it or start a mini-program. The name and description in the screenshot are suitable; visibility remains the user's choice.

Clone once and import that same local directory into WeChat DevTools. Validated revisions go to stable `main`; each delivery includes its commit, changes, actual checks, unverified items and upgrade notes. After checking local changes, the user runs `git pull --ff-only origin main`, then compiles and previews. Preserve local changes and resolve divergence instead of forcing a reset. Experiments stay on feature branches.

Carry over the runnable frontend and the provenance of design, QA and development records. Do not copy unrelated backend work, credentials, caches or another contributor's uncommitted changes. Services remain non-OpenAI and unconfigured. Native structure, AppID handling and dependency commands will be settled when the repository is actually initialized; do not present it as an existing runnable mini-program.

## Avatars

Upload a local JPG, PNG or WebP, then drag, zoom, position horizontally/vertically, rotate in 90-degree steps or reset. A circular mask previews what appears as the avatar. Sliders provide an alternative to dragging. Use crop updates the profile draft; Save profile applies it. Cancel preserves the previous picture, and Adjust crop restores editable source and parameters.

Six original code illustrations are available: owl, finch, leaf, mountain, lake and initial. Current browser safeguards are 20 MB and 40 million decoded pixels; the working copy is bounded to a 2048-pixel long edge and the avatar output is a 512×512 JPEG. These are local avatar implementation parameters, not final bird-media upload limits. Failures preserve the previous avatar and late reads cannot overwrite a different draft. Original files are untouched and no upload occurs. Real accounts, storage, cross-device sync and native WeChat selection remain future integration; session avatars do not survive refresh.

## Map behaviour

The location button previously reset translation although the sample position was below the world midpoint. It now computes translation from that point, world dimensions and zoom so the dot lands at the map viewport centre. Zoom preserves the world point under that centre. Denied location access retains manual browsing.

The area card follows the map viewport centre while panning. Demo distances account for the 5:8 world aspect ratio, and hysteresis retains the current area near the boundary until another is clearly closer. There are only two fictional demo areas. Real integration needs coverage/regions, distance, zoom-dependent granularity and no-coverage handling; the demo is not a complete geospatial service.

Suggestions update while typing. Empty input lists six sample recommendations, Chinese and English matching work, and no match is stated honestly. At most three rows are visible; additional rows scroll within the panel. Arrow keys, Enter and Escape are supported, and scrolling suggestions does not zoom the map. Selecting a result centres it and opens details. Details use at most 45% of the viewport so the selected pin stays visible above them.

The area card moves down with clearance for the central navigation button. A compact illustration disclosure remains at the top while the map is simulated. Remove that disclosure after real-map integration, retain the chosen provider's attribution and adjust the freed space. Do not prematurely label a fictional map as real.

## Public place saves and check-ins

Following this feedback, place saves and check-ins are designed as public actions, explicitly labelled Save publicly / Check in publicly. Confirmation shows the user, place and audience before adding activity; pressing the active button withdraws it. Simulated publication failure adds nothing and supports retry or cancellation.

Only the chosen place and user are associated. Private observations, pictures, live coordinates and travel history are not attached. A check-in entered through search is user supplied and unverified, not proof of a visit. Verified presence would require a separate permission, accuracy, timing and fallback design.

Profile → Saved places and check-ins reopens the place. These states remain separate from private bookmarks of other people's content, bird collections and map observation publication. A place save adds no species; a check-in creates no bird observation. Real sharing between accounts is not connected.

## Badges and progress: proposed scope

The expanded concept page does not award points. Start with a first private observation, meaningful behaviour/habitat notes and a first journal. Unresolved and private records count. Editing one record must not earn repeated rewards. Badges do not certify identification accuracy or expertise.

Keep the garden, feather leaves and learning exercises as future proposals with no fixed levels or reward values yet. Avoid rare-bird, precise-location, check-in-volume or popularity rankings and missed-day penalties. Exercise sources, repeated rewards and deleted-record handling need separate decisions.

## Direct and group chat: proposed scope

The expanded concept page sends no messages. Start direct chat with mutual friends; decide stranger requests separately. Small outing groups use invitations, admins, mute/leave, member removal, blocking and reporting. Friendship does not add someone to a group or expose private records.

Define pending/sent/failed-and-retry states, unread counts, offline recovery, deduplication, history access, notifications and deletion/withdrawal rules. Do not promise read receipts or end-to-end encryption. Sharing a journal or observation requires a field preview and must not implicitly grant access to private source records. Precise group meeting locations are not public by default.

Suggested sequencing is stable map/identification/journal/private-save flows, lightweight milestones, then real messaging infrastructure. This is a design recommendation for review, not an automatic expansion of the team's current acceptance scope.


## Chevron polish and four-day experience-build preparation

30 October 2026: the existing clue-panel toggle now uses a fixed-size, rounded-stroke SVG chevron. aria-expanded controls its rotation; reduced-motion preferences remove the transition. Panel behaviour is unchanged.

Suggested repository creation settings: NoctisBaguette / bird-assistant-miniprogram, retain the screenshot's description, Public matching the course-source workflow (Private is also a user choice), no initial README, no .gitignore and no license selection. Seed the project README and mini-program ignore rules together with the first source commit. Use stable main and Issues. This round does not create the repository.

The four days are relative working days; no start date was specified. Proposed scope: Day 1 confirms AppID/member/configuration and an early phone-running/upload path with the native shell and five tabs. Day 2 establishes capture/import → review → private save/reopen with permission fallbacks and retained evidence on errors. Day 3 adds map/search, journal, avatars and available identification adapters, then freezes features. Day 4 focuses on real-device, weak-network, lifecycle, permission, cache, text and screen regression, blockers and a tester-ready build with known issues. Full messaging, complex garden mechanics and optimized real-time multimodal inference remain later work.

A DushiSports retrospective would help: record exact tool/library/language versions, build structure/configuration, AppID/member setup, component/style/safe-area issues, cloud/function deployment, login/database permissions, media uploads/temp paths, domains/network/device differences, privacy permissions and experience-build delivery. For each actual issue give trigger → original error → root cause → applied fix → verification, with resolved/unresolved/reusable status. Exclude credentials and unrelated personal data. Those project files were not read in this round; this checklist does not claim all listed failures occurred or authorize reuse of its identity/data environment.

GitHub creation reference: https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository .
