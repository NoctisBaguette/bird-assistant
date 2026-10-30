# Live and imported identification: frontend handoff v0.10

30 October 2026. Based on [discussion #20](https://github.com/bird-assistant/bird-assistant/issues/20), the 29 October meeting and the current #12/#13 contracts. [中文](../09-live-identification-design.md).

This revision completes clickable screens, states and evidence handoff for the next WeChat DevTools implementation. It does not access a camera/microphone, upload evidence, run recognition or write a phone album. The viewfinder, scores, capture and album outcomes are labelled demonstrations. Evidence and observations remain session-only; explicitly saved journals still use browser-local storage.

## Screen contract

Navigation remains Home | Journal | Identify | Discussion | Profile; Collection stays under Profile. Identify opens the live view directly, replacing four separate capture tiles.

| State | Screen / behaviour | Existing mapping |
| --- | --- | --- |
| L01 | Live finder, bird box, visual clue, separate sound clue, zoom, capture, import, review | Replaces P06; expands P07/P09 |
| L02 | Quick / Wait; pause/resume; tap photo, hold/release video; Space/Enter equivalent | New live interaction |
| L03 | Gallery photos/video or audio files, accumulated evidence and removal | Expands P08/P09 |
| L04 | Individual preview, real local media playback, analysis time segment without changing the original | Expands P07/P08 |
| L05 | Shared evidence review, album outcome, separate visual/audio evidence, user species choice | Expands P12 |
| L06 | Pending/cancel/error/retry/unknown; evidence and user choices retained | P11/P12 |
| L07 | All selected evidence, original sample model result and user label handed to private observation | P13 |
| L08 | Camera/audio denial, offline, stale result, storage/album failure and leaving a recording | Expands P28 |

The original 19 stories / 28 pages remain a historical baseline, not a count of newly implemented native screens. L01–L08 extend that baseline without renumbering it.

## Interaction decisions

- Camera readiness and recognition startup are independent. Native capture must not wait for location, weather, a connection or a model. The browser uses illustrative artwork.
- Quick/Wait describe situations, not user identities. Wait will reduce analysis later; Pause stops the viewfinder. Paused/off-camera operation cannot promise visual prehistory.
- Tap captures a sample photo. A hold longer than 380 ms starts a sample video; release finishes it. Space/Enter support the same interaction. This gesture threshold is a prototype setting. Pointer cancellation discards the unfinished gesture. Backgrounding, blur or confirmed navigation finishes and retains an already started sample video.
- Audio clues have an independent toggle. Keep call explicitly retains a sample audio item, including when camera access is denied. Video recording demonstrates deferred audio analysis, a conservative fallback pending device concurrency testing.
- Review ends the view. If no deliberate photo/video exists, normal live review can offer at most two preview-quality recovery candidates, unselected. Paused/denied/low-storage cases do not fabricate recovery images. Import-only review never adds live frames.
- Real files stay local and unmodified. Images must decode; media playback failures preserve evidence. Prototype limits are six items/session, 6 MB/image, 40 MB/video, 20 MB/audio. They are not native product limits.
- Preview can choose a valid analysis time segment for video/audio after duration becomes known. It stores metadata only and does not trim/export the file. Initial sample/real-file analysis ranges are at most 15 seconds.
- Analyse the selection or save unresolved immediately. Sample inference never confirms species. Review offers a user choice; the observation form also allows manual naming. All selected items are bundled; a photo is preferred as the cover.
- A recent audio judgment is separate from a saved audio file. Audio may refer to a different bird, and scores are not averaged or attached to every visual target.
- Private saving, collection, album writing, map publication and forum publication remain separate decisions and outcomes.

## Required states

| Condition | Visible response |
| --- | --- |
| Normal | Sample box/match and separate sound clue; immediate shutter |
| Stable label / correction | Review preset demonstrates stable → held → checking new evidence → corrected label |
| Offline / stale | Retire old overlay, show last clue/waiting; retain capture |
| Camera denied | Explain unavailable camera; offer import and independent audio |
| Audio denied / paused | State that audio is inactive; keep visual/import usable |
| Storage / album failure | Retain captured evidence in the demo; failed status and retry |
| Analysis failed / cancelled | Retain evidence and user choice; retry or save unresolved |
| Selection or segment changed | Invalidate prior analysis and ignore stale completion |
| Leaving video | Finish and retain, or return to recording |

Similarity is not calibrated correctness probability. Values such as 86% are sample data. Native results must supply real scores, timestamps and stability. Preserve original model output separately from the user's final label.

## Native implementation handoff

Suggested screens are identify/index, identify/import, identify/preview, identify/review and observation/edit, following the team's chosen framework and existing project. Reuse navigation and existing map/journal/community/profile components.

| Boundary | Native responsibilities |
| --- | --- |
| Capture service | Native camera, actual zoom range, photo/video paths, capture timestamp, permissions and background release; test microphone concurrency early |
| Media repository | Separate originals/analysis derivatives, bounded buffers, protected intentional captures, album receipts, durable drafts and crash cleanup |
| Vision adapter | Current #12 session/HTTP image-frame/WebSocket contract, one upload, latest frame, stale expiry, crop/rotation/mirror-aware boxes |
| Audio adapter | #13 currently supports completed-file analysis; continuous windows require an agreed extension and honest concurrency fallback |
| Review model | Stable IDs, type, source, selection, analysis segment, capture-time precision, save outcome; model evidence and user choice kept separate |
| Context | Actual capture-time context for live media; unknown historical metadata stays unknown. Consent/settings follow later; lookup failures never block capture |

A native component does not guarantee complete OEM camera features. Preview RGBA is not sensor RAW; RAW/HDR pairs are not promised. Frame encoding, local inference, adaptive rates and approximately ten-second pre-capture buffers still require experiments. This revision defines interactions and fallback states, not finished optimizations.

Before native integration, test preview/zoom, shutter latency, camera-video/microphone concurrency, actual import formats, low storage/denied album permission, backgrounding, audio association and stale boxes. Record phone/OS/WeChat versions, with representative Huawei Mate/Pura, midrange Android and iPhone coverage.

## Review

Open v0.9 and Identify. External review presets cover offline, stale results, stable/corrected names, conflicting audio, camera/audio denial, low storage/album failure and existing analysis/unknown/private-save errors. Compact and English modes check layout. Source is recognition.js/recognition.css with app.js/index.html integration; build-offline.mjs creates the standalone file. See prototype/QA.md for actual verification and its limits.


## v0.10 review revision — 30 October 2026

These changes supersede the v0.9 presentation while retaining its capture/save boundaries. This is a frontend review checkpoint; the user will provide the team handoff later. Native DevTools implementation has not started.

- The preview fills the available portrait camera area, with controls overlaid. Preview, sensor buffer and saved-photo ratios are separate. Native scaling must preserve proportions and use the same rotation/crop/mirror transform for boxes; screen framing must not silently crop device originals.
- Quick has a gentle extended-use heat hint. Expanded guidance explains possible heat, battery use and slowdown, offers Switch to Wait, and makes clear that Wait can still generate heat. No untested mandatory duration or silent mode change is introduced.
- One compact, expandable clue panel replaces stacked visual/audio cards. Tabs, horizontal swipes and arrow keys select the displayed channel without disabling either recognition stream or changing capture mode. Import stays one tap away.
- My species choice becomes Name in your record (optional). Unresolved remains the default. Users may explicitly adopt a visual/audio suggestion, enter a name, or return to unresolved. There is no fixed short species dropdown, and the original model evidence remains separate.
- Product size/count/format limits remain undecided. Temporary browser guards move into collapsed prototype notes. Future oversized-image handling should preserve originals and optimize a derivative to an agreed target while checking bird detail. Crop/reselect/defer are alternatives if quality cannot be maintained. Automatic compression, its provider/library and video policies are not implemented or selected.

Review portrait layout, collapsed/expanded control access, channel-switch independence, mode advice, optional naming and save handoff, compact Chinese/English, permissions and offline states. Two added state regressions cover display-channel independence and manual names preserving model evidence.
