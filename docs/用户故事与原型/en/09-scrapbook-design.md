# Outing journals: design, stories and implementation boundaries v0.7

Date: 2026-10-29. Based on this discussion, second meeting notes and main a84e479. Six stories and eight screens/states supplement the original 19/28 set. JRN-06 is future design, not implemented automatic generation.

Navigation: Home | Journal | Identify | Discussion | Profile. Collection stays under Profile and the material picker; retain the circular Identify button.

This is a browser prototype and design record, without native editing, AI, cloud journals, scheduling, a real forum or WeChat sharing.

## Screens and traceability

| ID | Screen/state | Stories | Route |
|---|---|---|---|
| J01 | Journal home | JRN-04, JRN-06 | journal |
| J02 | Material selection and dates | JRN-01, JRN-06 | journalPicker |
| J03 | Style, format and setup | JRN-02, JRN-06 | journalSetup |
| J04 | Object editor | JRN-02, JRN-03, JRN-04 | journalEditor |
| J05 | Non-destructive crop | JRN-03 | journalCrop |
| J06 | Reflow preview and application | JRN-02, JRN-03 | journalLayout |
| J07 | Preview, export and post draft | JRN-05 | journalPreview |
| J08 | Leaving, storage errors and clear confirmation | JRN-04, JRN-05, JRN-06 | journalLeave / journalClear / inline errors |

## Story cards

Priority and difficulty are proposals, not changes to the team schedule.

### JRN-01 Choose material

As a journal creator, I want to choose material so I can organise and express personal observations and continue editing later.

Proposed priority: High; difficulty: Medium; pages: J02. Status: Browser interaction demo; real integration unaccepted.

Acceptance conditions:

1. Select from the device library, personal observations and personal collected photos; reorder selections.
2. Filter by observation date and explicitly include unknown dates; never replace capture dates with import dates.
3. Filtering does not silently deselect material; the selected list remains visible.
4. Failed reads and cancellation retain material; audio and others’ bookmarks are not used directly as images.

### JRN-02 Create an editable draft

As a journal creator, I want to create an editable draft so I can organise and express personal observations and continue editing later.

Proposed priority: High; difficulty: High; pages: J03, J04, J06. Status: Browser interaction demo; real integration unaccepted.

Acceptance conditions:

1. Offer nature, magazine and minimal styles in 3:4, 1:1 and 4:3 as proposed design choices.
2. Keep photos, text and decorations as separate objects; exports never replace the editable original.
3. Use existing information without inventing weather, locations or species; retain unresolved labels.
4. Preview reflow before applying, support cancellation and undo, and explain that positions, background and decorations reset.

### JRN-03 Edit objects and background

As a journal creator, I want to edit objects and background so I can organise and express personal observations and continue editing later.

Proposed priority: High; difficulty: High; pages: J04, J05, J06. Status: Browser interaction demo; real integration unaccepted.

Acceptance conditions:

1. Move, resize, rotate, replace and change photo frames; cropping does not rewrite the source image.
2. Cancelling a crop retains the old window; edit wording, font, size, colour and alignment.
3. Add/remove elements, reorder layers, choose background colour/texture/image, and support undo/redo.
4. Validate touch gestures and Chinese fonts on WeChat devices; browser demos are not device acceptance.

### JRN-04 Save and restore private drafts

As a journal creator, I want to save and restore private drafts so I can organise and express personal observations and continue editing later.

Proposed priority: High; difficulty: High; pages: J01, J04, J08. Status: Browser interaction demo; real integration unaccepted.

Acceptance conditions:

1. Explicit saving survives reload with photos, text, crop and background; distinguish local and cloud states.
2. Failed saves retain edits without a success claim; provide explicit actions when leaving unsaved work.
3. Resolve unsaved work before creating/opening another journal; clearing local drafts needs separate confirmation.
4. Saving does not automatically collect, publish to maps or post; backend checks future cloud ownership.

### JRN-05 Export and share the image

As a journal creator, I want to export and share the image so I can organise and express personal observations and continue editing later.

Proposed priority: High; difficulty: High; pages: J07, J08. Status: Browser interaction demo; real integration unaccepted.

Acceptance conditions:

1. Preview the page and generate a PNG in the selected ratio with consistent photos and text.
2. Posts use a rendered copy; opening a draft is not publishing and leaves private originals and maps unchanged.
3. Baked-in text and locations cannot be removed by hiding attachment fields; review visible content before sharing.
4. Sharing depends on platform support and retains edits on cancellation/failure; WeChat needs device acceptance.

### JRN-06 Period suggestions preserve edited versions

As a journal creator, I want to period suggestions preserve edited versions so I can organise and express personal observations and continue editing later.

Proposed priority: Later; difficulty: High; pages: J01, J02, J03, J08. Status: Concept/settings only.

Acceptance conditions:

1. Use imported/saved material the user may reuse; do not scan the device library automatically.
2. Deduplicate suggestions by period and source revision; never assign unknown-date material to a particular day.
3. New material creates a new suggestion, without overwriting edited versions or publishing automatically.
4. This iteration only demonstrates a suggestion card and period labels, without scheduling, AI or multi-page annual albums.

## Data and state

The editable document contains schema version, title, dimensions, ratio, background, elements, source snapshots, timestamps and period label. Photos retain source, dimensions, placement, rotation and crop; text retains wording and styling. Future AI returns constrained layout/writing suggestions that the client validates.

Observations, journals, rendered images and post images remain separate. Labels are snapshots, without rewriting model output or promoting identification state. Reflow is previewed and undoable; sharing cancellation retains edits. Future suggestions need user/timezone/period/source-revision identity, deduplication and separate edited versions. The scheduling contract is unresolved.

## Prototype limits

Drafts use this browser/origin’s localStorage, not account sync or production storage. Switching browsers or moving the HTML may hide previous drafts. Failed saves retain work and allow export. Session reset preserves explicitly saved journals; clearing them has a separate confirmation.

The demo allows 1–6 images per page and JPG/PNG/WebP up to 6 MB per file. Imports become previews up to 1400 pixels on the long edge, without changing device files or reading EXIF. Cropping retains this preview; production needs a full-resolution media strategy. These are demo limits, not final requirements.

Samples are code-drawn illustrations. Fonts use system availability/fallbacks without WeChat validation. Day/week/month/year only label the draft; the suggestion card is fixed and no background task runs. Browser sharing is not WeChat integration. Text/locations baked into PNGs cannot be removed by hiding source fields.

## Issue #12 connection and open decisions

Recognition hands observation drafts to the shared business layer. Journals should use media/observation interfaces, not recognition-page internal state. Proposed fields include media ID, accessible preview, observation time/precision, user label/identification state, optional notes and provenance. The contract is not frozen; library photos need no recognition result.

Issue #12 initially excludes continuous live recognition, but its appended guide requests live sessions, frame uploads and WebSocket results. SRS V1.1 also includes live recognition in the core scope. The team must resolve the iteration boundary without silently deleting either requirement. Audio format/duration, gateway, still-image adaptation and the shared app foundation also need alignment. Current main has no native foundation; teammates’ branches/local work may differ.

This document does not edit #12, assign teammates or merge journal acceptance into recognition. Track journals separately and follow current issue assignments for #12.

## Implementation sequence

1. Review screens, stories and rendered output, then settle first scope.
2. Reuse the native TypeScript foundation; prove touch editing, crop, Chinese fonts, export and reopening before choosing an engine.
3. Resolve #12 scope/interfaces, then implement recognition separately.
4. Complete journal material selection, editing, durable saving, reopening and export; then AI, periodic suggestions and multi-page summaries.

## Sources

- [Second meeting notes](../../第二次会议纪要.md)
- [SRS V1.1](../../需求规格说明书/羽迹观鸟助手_软件需求规格说明书_V1.1.md)
- [Issue #12](https://github.com/bird-assistant/bird-assistant/issues/12)
- [Prototype instructions](../prototype/README.md)
- [Chinese counterpart](../08-scrapbook-design.md)

## v0.7 review revision (29 October 2026)

The user authorized implementation and reaffirmed that this project must not use OpenAI. A cheaper provider suited to the mini-program will be selected later. This revision creates no API key and calls no real generation service.

- Wheel, pinch updates and zoom buttons refresh the marker layer without a follow-up drag. The existing demo threshold is temporary; the selected map SDK will determine the final radius.
- One text object contains an optional title and body. Its right-edge handle and width slider rewrap at the same font size; measured typography determines height. Canvas overflow and long selector labels end with an ellipsis while complete text remains editable.
- The canvas stays pinned beneath the toolbar and shrinks as properties scroll. Focus follows the selected element with boundary clamping; whole-page viewing remains available. A fixed flow placeholder prevents controls moving during clicks.
- Complete document transactions cover typing sessions, gestures, crop confirmations and reflow. Selection, cancelled previews and no-op changes preserve redo. Up to 50 steps are retained; production memory handling remains future work.
- Selection headers expose Delete. Stable photo numbers gain approximate 3×3 location labels. Six extensible decorations are available. Preview/apply/export controls have spacing.
- The three styles are starting points, with alternative local compositions. Reflow retains photo identity, crops and all text; custom decorations, positions and background may be rebuilt. Richer layout/cropping services remain future integration.
- Writing controls cover standalone journal text, a photo caption and individual text boxes. Reflections, bird information and social posts accept typed instructions, checked photos and a layout budget. New overall text can use a gap above or below photos. Dictation uses browser capability with editable text and a keyboard fallback; real microphone and WeChat speech remain unverified.
- No canned output is presented as AI. The provider-neutral writing adapter is unconfigured. Tests inject a fake adapter only.

The request contract carries instruction, intent, language, existing title/body, target geometry and typography, suggested length, selected images with stable identity/context and uncertainty-preserving constraints. Semantically linked images are required; other images are opt-in. Personal experience must come from the user. The client approximates available space through measured text and nearby elements, previews returned title/body, warns about excess length, retains full text and applies only after confirmation. Failed requests preserve work; stale responses cannot attach to another journal.

Legacy schemaVersion 1 drafts migrate to 2 without removing elements, sources or complete text. The local storage key is unchanged; no date invention or automatic upload occurs.

Verification: 18 Node behaviour regressions; actual browser wheel clustering/splitting, combined title/body, right-edge width drag, complete undo/redo, selection preserving redo, decoration delete recovery, photo-linked writing briefs, preservation of 3,280 overflowing characters, compact Chinese/English layouts without horizontal overflow and an actual downloaded/opened 900×1200 PNG. Real AI, microphone, native pinch and WeChat remain unverified. See QA.md and development-log.txt.
