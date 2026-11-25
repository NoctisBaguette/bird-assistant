# Post media and durable drafts: 0.4.7 review candidate

26 November 2026, Beijing time. [中文](../POST-MEDIA.md)

The installed acceptance baseline remains0.4.6. This candidate keeps the earlier recognition fixes and adds square three-column thumbnails, full-image previews, per-photo parameters and removal. Square crops affect thumbnails only.

A post supports nine visual attachments total, including up to three saved journals. Journals are rendered snapshots using the editor's shared renderer; private editable documents and their source assets are not published. Editing a journal later does not mutate an existing post. No pixel editor is introduced.

Drafts use byte-preserving managed copies, reuse durable attachments, and commit their manifest only after all copies succeed. Cleanup is limited to unreferenced files owned by this post draft. Quota/copy/manifest failures roll back new copies and retain the previous complete draft. Latest words, per-photo parameters and explicit missing-image placeholders remain recoverable. Truly exhausted space still prevents full photo durability. Legacy single-image drafts remain readable.

The companion business service adds a gallery capability endpoint, validates nine images/three journals, ownership, duplicate IDs, cover agreement and standalone-post scope. Public indexed image routes apply the existing approval/withdrawal gates. Moderators can inspect every image. Camera sharing consent applies per image; public JPEG copies retain the existing EXIF/GPS stripping. Deploy the business service and moderation assets before testing multi-image publication. An older server blocks a multi-image preview before upload rather than silently posting only the cover; legacy single-image publication remains available.

Client verification passes195 checks, including eleven new regressions for attachment limits, original preservation, repeated saves, scoped cleanup, storage failure/recovery, rollback, legacy migration, stale callbacks and old-server protection. The local Python3.12 backend run passes479 tests with51 skips and87.01% coverage; Ruff passes. This is distinct from locked CI. Native grid, journal rendering, quota behaviour, restart, complete moderation and published-image saving still need acceptance.

Proposed follow-ups: one video up to10 seconds and one audio clip up to60 seconds, subject to complete storage/playback/moderation support; saving/exporting published media as its platform supports; and local pre-upload EXIF display. These are product proposals, not asserted platform limits or completed integrations. Server-side allowlisted metadata extraction already exists; unknown fields remain unknown and author-entered values remain separate.

No backend deployment, real model call, public post or moderation-account login was performed. Keep the current build while review continues.
