# User story cards v0.5

These are 19 proposed stories for review. Each has observable acceptance conditions, separate priority and difficulty, and designed screen references. All inherit the shared product rules. A clickable demonstration now accompanies these designs. Real-service and phone acceptance remain separate; see the prototype review log.

## MAP-01 Explore an area on the map

As a birdwatcher, I want to browse nearby sightings or choose another area, so I can decide where to explore.

- Proposed priority: High
- Implementation difficulty: Medium
- Basis and dependencies: Map provider, public data, location permission and marker rendering depend on issue 5.
- Designed screens: P01, P28
- Origin: User brainstorm with proposed acceptance details

Acceptance conditions

1. With permission and an available position, open around the user. Otherwise offer place search and manual browsing without blocking the page.
2. Allow dragging and zooming; preserve the viewport when returning from a detail or another main tab.
3. Distinguish public observations from my private markers. Opening a public observation shows when it was observed; an old record does not imply a bird is there now.

## MAP-02 Inspect observations at a place

As a map browser, I want to open the observations represented by a marker or place, so I can compare evidence from different people and dates.

- Proposed priority: High
- Implementation difficulty: Medium
- Basis and dependencies: Display clustering and lasting place membership need separate rules; the latter is unresolved.
- Designed screens: P01, P02, P03
- Origin: User brainstorm with proposed acceptance details

Acceptance conditions

1. A grouped marker opens its records or zooms to their area; selecting a named place opens that place's observation history.
2. Each row shows a thumbnail or media type, observation time, species or unresolved status, and public attribution.
3. Selecting one row opens that observation. Grouping preserves every original record, and its count means records rather than individual birds.

## MAP-03 Confirm an observation location

As a record owner, I want to use my current location or adjust a point on a map, so I can associate the record with where the encounter happened.

- Proposed priority: High
- Implementation difficulty: Medium
- Basis and dependencies: Location picker and accuracy handling depend on the selected map service.
- Designed screens: P16, P28
- Origin: User brainstorm with proposed acceptance details

Acceptance conditions

1. Offer current location and manual selection. A visible marker and an explicit confirm action determine the saved point.
2. An imported photo does not silently inherit the current location; the user can retain, correct or omit available location metadata.
3. Private saving can proceed without location. Map publishing requests a confirmed location and explains why it is required.

## MAP-04 Publish and withdraw a map contribution

As a record owner, I want to share a selected observation on the map, so I can contribute a sighting without composing a forum post.

- Proposed priority: High
- Implementation difficulty: Medium
- Basis and dependencies: Ownership, public fields, location disclosure and publication state must be implemented together.
- Designed screens: P15, P16, P26
- Origin: User brainstorm with proposed acceptance details

Acceptance conditions

1. Before publishing, show a preview of the public evidence, observation date, location and attribution; allow an unresolved species.
2. An explicit publish action creates the map contribution. It neither creates a forum post nor requires adding the record to a collection.
3. Anonymous attribution hides the public name while retaining ownership. The owner can edit or withdraw the map contribution without deleting the private original or an independent forum post.
4. Sensitive-location handling remains a team decision. The prototype exposes the disclosure choice without promising an unvalidated protection algorithm.

## MAP-05 Add context to an observation

As a record owner, I want to add notes and available weather information, so I can explain the conditions of the encounter.

- Proposed priority: Medium
- Implementation difficulty: Medium
- Basis and dependencies: Manual entry is sufficient for the design; historical weather service access is a separate candidate.
- Designed screens: P13, P15, P26
- Origin: User brainstorm with proposed acceptance details

Acceptance conditions

1. Notes and weather can be omitted. Missing information remains unknown rather than receiving invented defaults.
2. Manual weather is labelled as user supplied. A future service value must carry its source and the observation location and time it describes.
3. An old gallery image never receives today's forecast as its observation weather; lack of weather does not block saving or publishing.

## ID-01 Provide a bird photograph

As a birdwatcher, I want to take a photo or select one from my gallery, so I can request identification assistance and keep the evidence.

- Proposed priority: High
- Implementation difficulty: High
- Basis and dependencies: The photo interface is straightforward; usable species classification and the WeChat upload path remain unverified in issue 6.
- Designed screens: P06, P07, P08, P11, P12, P28
- Origin: User brainstorm with proposed acceptance details

Acceptance conditions

1. Offer separate camera and gallery actions, followed by preview, replacement and cancellation.
2. Denied permission or an unsupported image leaves a route to another input method; input is retained if analysis fails.
3. Show processing, candidate results, no reliable candidates and service failure as distinct states. Simulated candidates in the prototype are identified as examples.

## ID-02 Record a bird call

As a birdwatcher, I want to record and review a sound clip, so I can keep a useful clue when a clear photo is unavailable.

- Proposed priority: High
- Implementation difficulty: High
- Basis and dependencies: Phone recording, audio conversion, upload, BirdNET suitability and end-to-end behaviour require issue 6 follow-up.
- Designed screens: P06, P09, P11, P12, P28
- Origin: User brainstorm with proposed acceptance details

Acceptance conditions

1. Provide start, stop, replay, retake and submit controls, with visible recording state. Permission refusal keeps alternative inputs available.
2. Results can contain multiple candidates or no reliable identification. Allow saving the recording unresolved.
3. Do not promise that any one-second recording succeeds or that laptop inference time equals user waiting time. Recording guidance and limits remain subject to phone tests.

## ID-04 Review a proposed identification

As a record owner, I want to compare ranked candidates, similar species and source evidence, then select a label or keep it unresolved, so I can retain my judgement and the original evidence.

- Proposed priority: High
- Implementation difficulty: Medium
- Basis and dependencies: A stable candidate/taxonomy contract plus source attribution, score semantics and permitted reference data are required. Live source connectors remain candidates.
- Designed screens: P12, P32, P13, P26

Acceptance conditions

1. Present ranked candidates when available. Label each numeric value as a source-specific model score, reference similarity or validated probability, with source identity/version and missing values; do not relabel raw scores as accuracy or average unrelated source scores.
2. Offer a comparison of similar species using sourced reference features and permitted reference media when available. Distinguish reference descriptions from features actually detected in the submitted evidence, including relevant sex/age differences.
3. Show source availability and disagreements. An unavailable reference service does not erase model results or block private saving; no reliable candidates remains distinct from conflicting candidates. Do not imply disconnected sources were searched.
4. Allow selection, manual correction or unresolved saving. Preserve the evidence, original candidates, scores and source context independently of the user label and subsequent edits. A user-selected name is not expert verification.
5. A detection box does not establish a species and tracking IDs do not count individual birds. Community suggestions, reviewed reference examples and expert-reviewed labels have distinct status; reference reuse and training follow separate eligibility and permission rules.

## REC-01 Save and revisit a private observation

As a record owner, I want to save the evidence and available details, so I can return later to organise or share the encounter.

- Proposed priority: High
- Implementation difficulty: Medium
- Basis and dependencies: Media storage, durable saves and ownership need agreement with the backend team.
- Designed screens: P13, P14, P03
- Origin: User brainstorm with proposed acceptance details

Acceptance conditions

1. The save form accepts unresolved species and missing location. Missing observation time is shown as unknown; it is not replaced by upload time.
2. A successful save appears in history with its evidence and current status. Cancellation does not create a saved record.
3. Private saving does not publish to the map or forum. An optional add-to-collection choice may be included on this same form.
4. A save error preserves the entered content and offers retry. The prototype distinguishes a session-only simulated save from a real durable save.

## REC-02 Keep evidence when identification fails

As a birdwatcher, I want to continue recording after an unsuccessful analysis, so I can avoid losing the encounter because recognition is unavailable.

- Proposed priority: High
- Implementation difficulty: Medium
- Basis and dependencies: Draft retention and retry state are required; persistent offline synchronisation is not established by this story.
- Designed screens: P11, P12, P13, P14
- Origin: User brainstorm with proposed acceptance details

Acceptance conditions

1. Distinguish no reliable candidates, service failure, input validation failure and user cancellation.
2. After a failed analysis, retain the selected evidence and notes and offer retry or save unresolved.
3. A repeated retry or double tap does not silently create duplicate saved observations. Saving still reports its own success or failure.
4. If the device is offline, only promise retention capabilities that have actually been implemented; the design labels any session-only demonstration.

## COL-01 Organise my personal collection

As a birdwatcher, I want to add my observations to a collection and browse them, so I can review the birds and encounters I have chosen to keep together.

- Proposed priority: High
- Implementation difficulty: Medium
- Basis and dependencies: Species grouping and the relationship between a collection entry and its source record need a shared data model.
- Designed screens: P04, P05, P13, P14
- Origin: User brainstorm with proposed acceptance details

Acceptance conditions

1. Add or remove a collection entry explicitly, either from a saved record or while saving. Removal does not delete the source observation.
2. Start with a species grid and an unresolved group, with a way to open individual observations and their evidence; this default is proposed for review.
3. A private observation can belong to a collection without publication. Unresolved observations and bookmarks of others do not increase my total of user-selected species from personal observations.

## COL-02 Browse shared collections

As a collection browser, I want to view collections shared by friends and other users, so I can learn from their observations and explore their public work.

- Proposed priority: Medium
- Implementation difficulty: Medium
- Basis and dependencies: Needs collection visibility, public profiles and a defined friend relationship.
- Designed screens: P04, P05, P21
- Origin: User brainstorm with proposed acceptance details

Acceptance conditions

1. Provide Friends and Public collection views with visible owner and sharing scope.
2. Only display collections and media the viewer is authorised to see. Becoming friends does not by itself expose every private record.
3. Opening or saving another user's content never turns it into my own observed-species record; unavailable content has a clear state.

## COL-03 Explore a regional collection

As a collection browser, I want to browse public records within a named area and time range, so I can understand what has been recorded in that area.

- Proposed priority: Medium
- Implementation difficulty: High
- Basis and dependencies: Region boundaries, public data coverage, taxonomy and deduplication depend on issue 5 and team decisions.
- Designed screens: P04, P05, P01
- Origin: User brainstorm with proposed acceptance details

Acceptance conditions

1. Show the selected region, time range and data source alongside the regional view. The prototype may use named example regions.
2. Include only records eligible for public regional display; private records are excluded.
3. Label observation count and species count separately. Do not infer a count of individual birds or claim complete regional coverage.
4. The exact boundary rule is unresolved; the interface displays the chosen area instead of silently treating a map cluster as a biological region.

## COL-04 Bookmark other people's content

As a browser, I want to save an observation or post for later, so I can find useful content again without copying it into my personal sightings.

- Proposed priority: Medium
- Implementation difficulty: Low
- Basis and dependencies: Bookmarks reference source visibility; deleted or restricted sources need an unavailable state.
- Designed screens: P03, P18, P27
- Origin: User brainstorm with proposed acceptance details

Acceptance conditions

1. A bookmark action toggles on and off and the saved item can be found in a Saved view.
2. The bookmark retains the original author and links to the source. It does not increase personal encounter or observed-species counts.
3. If source content is withdrawn or becomes inaccessible, show an unavailable reference without exposing protected media.

## COM-01 Publish and manage a forum post

As a community member, I want to write a post and optionally attach an observation, so I can share an experience or ask for help.

- Proposed priority: High
- Implementation difficulty: Medium
- Basis and dependencies: Needs post ownership, media visibility, drafts and a clear relationship with an attached observation.
- Designed screens: P17, P18, P19, P26
- Origin: User brainstorm with proposed acceptance details

Acceptance conditions

1. Start a post from Discussion or a saved observation; enter discussion content and choose optional evidence or location.
2. If the source observation is private, preview exactly which selected fields and media will become public in this post.
3. Publishing a post does not create a map contribution. Leaving unsaved edits offers a clear keep-or-discard choice.
4. The owner can edit or withdraw the post. Withdrawal leaves the private observation and any independent map contribution intact.

## COM-02 Read and respond to a discussion

As a community member, I want to read posts, reply and react, so I can exchange useful information with other birdwatchers.

- Proposed priority: High
- Implementation difficulty: Medium
- Basis and dependencies: Requires ownership and access rules for replies and reactions; real moderation remains a group design task.
- Designed screens: P17, P18, P27
- Origin: User brainstorm with proposed acceptance details

Acceptance conditions

1. Open a post with its author, content, selected attachments and replies; inaccessible attachments are handled explicitly.
2. A valid reply becomes visible after success. Show pending and failed states without losing the draft or duplicating a retry.
3. Like and bookmark actions have visible reversible states. A suggested species in a reply does not automatically overwrite the owner's identification.

## SOC-01 Connect with another user

As a community member, I want to open a public profile and request a friend connection, so I can return to people whose observations interest me.

- Proposed priority: Medium
- Implementation difficulty: Medium
- Basis and dependencies: Mutual request and acceptance is the proposed rule; the team has not chosen it over following.
- Designed screens: P21, P29
- Origin: User brainstorm with proposed acceptance details

Acceptance conditions

1. A non-anonymous attribution can lead to the author's public profile; an anonymous label does not reveal that identity through a profile link.
2. Demonstrate request, pending, accept or decline, and remove-connection states under the proposed mutual-friend model.
3. Friendship does not change collection visibility settings. Access still depends on the current relationship and visibility; removing a friend revokes access to friends-only content. Prototype requests are simulated and send no real notifications.

## USR-01 Review and edit my profile

As a account owner, I want to view my activity and change my public profile details, so I can manage how I appear and find my own records.

- Proposed priority: Medium
- Implementation difficulty: Medium
- Basis and dependencies: Account identity is a backend dependency; the prototype uses an explicitly simulated identity.
- Designed screens: P20, P30, P14, P04
- Origin: User brainstorm with proposed acceptance details

Acceptance conditions

1. Provide entries to observation history, my collection, saved content, friends and settings.
2. Allow editing a display name and avatar with save, cancel and validation-error states; an abandoned edit does not change the profile.
3. Explain any displayed counts. User-selected species from personal observations exclude unresolved candidates and bookmarks of others; badge rules remain a candidate feature.

## USR-02 Manage preferences and cached data

As a account owner, I want to review my preferences and clear disposable cached files, so I can control the experience without losing original records.

- Proposed priority: Medium
- Implementation difficulty: Medium
- Basis and dependencies: A storage inventory must distinguish recoverable cache, originals and unsynchronised files before implementation.
- Designed screens: P25, P31
- Origin: User brainstorm with proposed acceptance details

Acceptance conditions

1. Show publication preferences and permission status; a change to a default clearly states whether it applies only to future actions.
2. Keep existing publications unchanged unless the user explicitly edits or withdraws them; a preference change is not presented as automatic retroactive privacy.
3. Before cache clearing, show the intended effect and confirmation. Exclude unique originals and unsynchronised records from disposable cache.
4. The prototype simulates confirmation and completion without deleting real device files.
