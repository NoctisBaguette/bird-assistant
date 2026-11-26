# Bird Assistant — user backlog and acceptance queue

Updated 26 November 2026, Beijing time. [Chinese authoritative working copy](../BACKLOG.md)

The Chinese checklist assigns stable IDs to the user's requests and observed defects. The cumulative [private development log](https://github.com/NoctisBaguette/bird-assistant-miniprogram/blob/main/docs/development-log.txt) retains their history. Current implementation is determined from the repository.

The user's **0.4.6** build remains the acceptance baseline. Confirmed: the local176-check suite, community registration, opening the camera and importing/reviewing the clear EXIF Tree Sparrow photo. The first actual inference attempt is blocked before a model result. Public vision readiness returns **Caddy502**, while the catalogue returns200 and protected observations401. Registration does not prove vision connectivity.

Only documentation advances on private main. The0.4.7 candidate lives on a separate review branch; this work does not deploy a server, merge the team PR or require the user to update their test build.

| IDs | Requests and remaining evidence |
| --- | --- |
| S01–S07 | P0 shared-service repair and restart recovery; normal access on/off campus and mobile data without a personal laptop; explicit local development mode and truthful helper startup; real photo/live identification; capture/zoom/recording lifecycle; independent selected media/audio/both submissions; actual audio/video integration; coordinated backend deployment using the existing identity/data boundaries. Public connection selection cannot repair the upstream502. |
| U01–U06 | Latest UI defects: equal two-line camera/audio detail height, complete unclipped media cards, fallback photo selection only after the main picker fails, smaller photo/audio upload blocks, consistent review spacing, and natural-ratio photos without a solid backdrop. Candidate implementation still requires native acceptance. |
| U07–U08 | Original audio filenames/ellipsis/playback/persistence; multiple selected photos, independent preview and submission set, per-file results/errors and cancellation. Source exists; device testing remains. |
| M01–M08 | Close icon and map/drawer/tab boundaries/layering; central Identify orb foreground; cold first-tap markers at every zoom; dynamic translucent1–3-row search; global distance/date sorting and pagination after deployment; Chinese region names; working places/discussion/comparison from deep observation navigation; metadata flips with honest absent-field handling; real phone GPS and supported map-app navigation. |
| F01–F04 | Real posting/preview/moderation/comments/nested replies, retained drafts/failure recovery; independent like/bookmark state and visuals; readable relationship between a discussion and its map observation; useful posting tools/menu/refresh. Replies and reactions remain on the original discussion. |
| A01–A02 | Full WeChat/community identity and session expiry/logout/account isolation; profile/avatar upload/crop/cancel/save/restart; one initial for English names and1–2 Chinese characters for Chinese names; history/bookmarks/statistics/storage. Community registration alone is the currently verified subset. Phone binding was discussed, not imposed as mandatory. |
| Q01–Q05 | Readable structured Qwen-plus output; the teammate's photo-to-journal request using1–4 selected images and the visual model; shared journal/forum writing with fact boundaries, preview/apply/undo/cancel and real authentication/quota/deployment evidence; domestic mixed Chinese/English ASR with correction; journal editing/autosave/recovery/templates/crop/proportion locks/export. Qwen remains this workflow's responsibility. |
| T01–T04 | Named map-linked recommendations instead of unexplainedA1–A4; useful species/habitat/season/weather/time/quiet-location guidance supported by real local evidence; profile consultation history and follow-up; approved local forum retrieval in the candidate; outside-community retrieval and further place/freshness ranking remain queued. Current history is bounded, device-local and account-separated, with no cross-device sync. Coarse records do not prove a bird was inside a named park. |
| X01–X03 | iPhone/Huawei/Harmony/other Android, iPad/tablets, Windows WeChat, folding/dual/split screens and changing DPI/window sizes; keyboard/safe areas/large type/permissions/media; later fade/move/dissolve and interaction polish; ongoing offline/background/restart/low-storage/race recovery. Source projection and mocks do not establish native support. |
| O01 | Optional map region-lighting/sighting progress. The user explicitly did not require implementation; it follows the core flows if later selected. |

Current0.4.6 testing can continue with profile changes and cancellation/persistence, an unpublished forum draft with image/metadata/preview/return recovery, and public species-navigation checks. After readiness returns200: phone location and a clear photo, multiple photos/no-bird/cancellation, live tracking, actual posting/moderation/replies, real photo-Qwen and updated trip/history, then broader profile/device/animation work. Do not replace pending acceptance with the existence of code or historical CI.

## New post-media feedback, 26 November

Six additions bring the queue from42 to48; previous responsibilities remain. [Candidate details](POST-MEDIA.md).

| ID | Request | Status |
| --- | --- | --- |
| P01 | Square thumbnails, full-image viewing and balanced parameter spacing | Candidate; original bytes/ratio remain intact; no undecided pixel editor. |
| P02 | Attach saved journals, including multiple works | Candidate: nine visuals total including three rendered journal snapshots; companion business/moderation deployment and native acceptance pending. |
| P03 | Explicit photo/audio/video limits | Visual9/journal3 in candidate; one10-second video and one60-second audio remain proposed follow-ups requiring storage/playback/moderation. |
| P04 | Other users can save post media | Explicit public photo/journal-image save is implemented and needs native acceptance; video/audio export follows their real integration. |
| P05 | Draft saving fails | Screenshot shows file quota; candidate adds reusable byte-preserving managed copies, scoped cleanup, rollback and text/parameter recovery. Real exhausted space still prevents photo persistence. |
| P06 | Extract photo metadata itself | Server allowlisted EXIF extraction exists; original bytes preserved; local JPEG/PNG/WebP/TIFF header reading and per-photo display are implemented in the candidate; unsupported/absent values remain unknown. |

Client229 passes; local backend507/51 at87.41%, Ruff clean. [Development continuation](SPRINT-2026-11-26.md) covers local EXIF/public saves, scoped recording recognition, cited forum experience, domestic editable ASR and media lifetimes. ASR defaults disabled, audio public readiness is404 and vision502; production/native/model quality remain separate. Keep installed0.4.6.

Current S06/Q04/T04/P04/P06: audio transport and scoped mobile authorization are implemented but undeployed; photo/audio batches keep separate results. Journal/forum speech notes use explicit domestic Qwen transcription, editable preview and confirmed append; no OpenAI service, no automatic writing/publication. Approved recent forum experience is linked only to public map regions, with dates and original-post citations; outside-community retrieval remains queued. Explicit saves cover public photos/journal images; video/audio publication and export remain future work.

[Local real BirdNET validation](AUDIO-VALIDATION-2026-11-26.md) covers40 correlated variants from five birds/three controls plus eight invalid uploads. Public connectivity, native recordings and local-species accuracy remain open under S01/S06.
