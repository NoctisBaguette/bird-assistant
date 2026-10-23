# Screen design outline v0.5

Status: screen specifications paired with a clickable demonstration. Real recognition, accounts and device services are not connected. Screen IDs are stable references for cards, implementation and review. Gaps in numbering reserve earlier candidate screens.

## Five main tabs

| Tab | Layout and behaviour |
| --- | --- |
| Home | Top search and filters; map in the main area; marker selection opens a bottom sheet; the five-tab bar remains on the main page. |
| Collection | Mine, Friends, Public and Regional segments; species tiles with an unresolved group; Saved has its own entry so bookmarks remain distinct. |
| Identify | Camera/photo and sound choices. Photo preview or recording preview leads to analysis, candidate review and private save. Live/video are labelled candidate designs. |
| Discussion | Feed, post detail with replies and reactions, and a compose action; an attached observation has an explicit public-fields preview. |
| Profile | Profile details, defined counts and entries to history, collections, saved items, friends and settings; badges remain a candidate. |

## Screens and states

| ID | Screen or state | Content and interaction | Stories |
| --- | --- | --- | --- |
| P01 | Home map | Map with place search, date/species filters, public/private marker legend, pan, zoom, locate and selected-marker state. | MAP-01 MAP-02 COL-03 |
| P02 | Place observation sheet | Part-height sheet with place or cluster context, record count, date order and selectable observations. | MAP-02 |
| P03 | Observation detail | Evidence, observation time, source, attribution and identification status; bookmark for others, owner actions for mine. | MAP-02 REC-01 COL-04 |
| P04 | Collection home | Mine, Friends, Public and Regional views; Mine starts with species tiles plus unresolved; Saved has a distinct entry. | COL-01 COL-02 COL-03 USR-01 |
| P05 | Collection detail | Owner or region, sharing scope or time range, species/record counts and links to individual evidence. | COL-01 COL-02 COL-03 |
| P06 | Identify entry | Large central navigation entry; Photo and Sound as designed inputs; live/video remain labelled candidate options. | ID-01 ID-02 |
| P07 | Photo input | Camera and gallery choices; permission denial or invalid-file branch returns to an available input. | ID-01 |
| P08 | Photo preview | Selected image, optional subject selection, replace, cancel and analyse; preserve the image on error. | ID-01 |
| P09 | Sound input and preview | Ready, recording, stopped and replay states; retake, cancel and submit; recording limits are not yet fixed. | ID-02 |
| P11 | Analysis status | Working state; separate invalid input, no reliable candidates, service failure and cancellation routes. | ID-01 ID-02 REC-02 |
| P12 | Candidate review | Ranked example candidates, source-specific score labels, comparison entry, manual correction and unresolved; suggestions remain distinct from the user label. | ID-01 ID-02 ID-04 REC-02 |
| P13 | Private save form | Observation time, optional location, notes/weather and optional add-to-collection; private save plus retry on save error. | MAP-05 ID-04 REC-01 REC-02 COL-01 |
| P14 | My observation history | Saved records by observation date, unresolved status and owner actions; distinguish observation and upload times. | REC-01 REC-02 COL-01 USR-01 |
| P15 | Map publish preview | Public fields, date, confirmed location and public/anonymous attribution; explicit publish and publication status. | MAP-04 MAP-05 |
| P16 | Location confirmation | Current location or dragged marker with confirmation; location source/uncertainty when available. | MAP-03 MAP-04 |
| P17 | Discussion feed | Post list with media, authors and reply entry; compose directly or attach an existing observation. | COM-01 COM-02 |
| P18 | Post and replies | Public content and permitted evidence, reply draft, pending/error states, reversible like and bookmark. | COM-01 COM-02 COL-04 |
| P19 | Post editor | Body and optional observation/media/location; selected public fields preview; save draft/discard/publish routes. | COM-01 |
| P20 | My dashboard | Profile details, well-defined activity counts and links to history, collection, saved content, friends and settings. | USR-01 |
| P21 | Public profile and friends | Visible profile, permitted collections, connection state and friend-list entry; no identity link for anonymous posts. | COL-02 SOC-01 |
| P25 | Preferences | Permission status, future publication defaults, visibility explanation and cache manager entry. | USR-02 |
| P26 | Owner record and publication management | Private source and published destinations listed separately; edit preview states what changes; separate withdraw actions. | MAP-04 MAP-05 ID-04 COM-01 |
| P27 | Saved content | Bookmarks retain authors and original links; an unavailable state covers deleted or restricted sources. | COL-04 COM-02 |
| P28 | Permission and missing location states | Explain the blocked capability and offer manual browsing, another input, retry or cancellation as appropriate. | MAP-01 MAP-03 ID-01 ID-02 |
| P29 | Friend request states | Simulated request, pending, incoming accept/decline and remove-connection views. | SOC-01 |
| P30 | Edit my profile | Display name and avatar draft with validation feedback, save success and cancel. | USR-01 |
| P31 | Cache confirmation | Recoverable files and protected originals explained; simulate confirm, completion and failure without real deletion. | USR-02 |
| P32 | Candidate evidence comparison | Compare submitted evidence with sourced species features; show score meanings, available/unavailable/disagreeing source states, reviewed-reference eligibility, return to selection, replace evidence or save unresolved. | ID-04 |

## Candidate screen reservations

P10 is reserved for short video; P22 and P23 for messages; P24 for badges. These are outside the 19-card proposed set until their scope is promoted and designed in sufficient detail. Continuous camera assistance also requires a separate state design.

## Editing and publication

P26 presents the private original, map contribution and forum post as separately managed destinations. Proposed public-copy behaviour: only previewed fields are published, and updates to a private source do not silently expand public content. Withdraw actions identify their destination and explain what remains. Back-end representation and source-deletion handling still need agreement.
