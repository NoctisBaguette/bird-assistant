# Design coverage and prototype review

## Coverage

All 19 stories map to an existing screen outline. The prototype demonstrates these designs with simulated services; the review guide records specific browser checks and remaining limits.

| Story | Designed screens | Status |
| --- | --- | --- |
| MAP-01 | P01, P28 | Demonstration available; specific browser checks recorded separately |
| MAP-02 | P01, P02, P03 | Demonstration available; specific browser checks recorded separately |
| MAP-03 | P16, P28 | Demonstration available; specific browser checks recorded separately |
| MAP-04 | P15, P16, P26 | Demonstration available; specific browser checks recorded separately |
| MAP-05 | P13, P15, P26 | Demonstration available; specific browser checks recorded separately |
| ID-01 | P06, P07, P08, P11, P12, P28 | Demonstration available; specific browser checks recorded separately |
| ID-02 | P06, P09, P11, P12, P28 | Demonstration available; specific browser checks recorded separately |
| ID-04 | P12, P32, P13, P26 | Demonstration available; specific browser checks recorded separately |
| REC-01 | P13, P14, P03 | Demonstration available; specific browser checks recorded separately |
| REC-02 | P11, P12, P13, P14 | Demonstration available; specific browser checks recorded separately |
| COL-01 | P04, P05, P13, P14 | Demonstration available; specific browser checks recorded separately |
| COL-02 | P04, P05, P21 | Demonstration available; specific browser checks recorded separately |
| COL-03 | P04, P05, P01 | Demonstration available; specific browser checks recorded separately |
| COL-04 | P03, P18, P27 | Demonstration available; specific browser checks recorded separately |
| COM-01 | P17, P18, P19, P26 | Demonstration available; specific browser checks recorded separately |
| COM-02 | P17, P18, P27 | Demonstration available; specific browser checks recorded separately |
| SOC-01 | P21, P29 | Demonstration available; specific browser checks recorded separately |
| USR-01 | P20, P30, P14, P04 | Demonstration available; specific browser checks recorded separately |
| USR-02 | P25, P31 | Demonstration available; specific browser checks recorded separately |

## Prototype walkthroughs for review

| ID | Walkthrough | Route | Expected result |
| --- | --- | --- | --- |
| D01 | Browse without permission | P28 → P01 → P02 → P03 | Declining location still permits browsing; the detail shows observation date. |
| D02 | Save a private photo record | P06 → P07 → P08 → P11 → P12 → P13 → P14 | Private history gains one record; public map and forum stay unchanged. |
| D03 | Review an uncertain sound | P06 → P09 → P11 → P12 → P13 | Replay, retain evidence and save unresolved; no user-selected species count is added. |
| D04 | Collect and bookmark separately | P14 → P04/P05; P03/P18 → P27 | Own collection entry links to my record; a bookmark retains its external author and does not alter personal species counts. |
| D05 | Publish only to the map | P14 → P15 → P16 → P26 | Previewed contribution appears on the map; no forum post is created; withdrawal retains the private original. |
| D06 | Publish only to the forum | P14 or P17 → P19 → P18 → P26 | Private-source attachments receive a public preview; no map contribution is created. |
| D07 | Recover from errors | P11 → retry or P13; failed save → retry | Retain selected evidence and notes; repeated input does not duplicate records. |
| D08 | Shared and regional views | P04 → P05 → P21 | Display owner or area/time and permitted records; restricted sources show unavailable states. |
| D09 | Friends and settings | P21 → P29; P20 → P30; P25 → P31 | Requests and profile changes have clear states; cache confirmation excludes unique originals. |

## Required review before GitHub submission

- Confirm the proposed story set and candidate boundary with the team.
- Use the recorded browser walkthroughs as bounded evidence; verify any remaining acceptance/device paths before claiming completion.
- Check phone portrait layout, labels, Back behaviour, preserved map position and unsaved-input prompts.
- Confirm that public previews, anonymous links, restricted bookmarks and withdrawal preserve the stated access rules.
- Reconcile story priorities and difficulties with the survey and technical investigations.
- Add the group's architecture, technology decisions, iteration contents and division of work to the overall course submission.
- Keep the individual AI-use log with real prompts, edits and checks as required by the course materials.


## v0.5 comparison review

ID-04 now includes P32. The proposed set remains 19 stories and expands to 28 designed states. Photo/audio sample scores, source availability, source conflict, selection retention and independent unresolved saving are the focused regression targets. Only completed browser checks belong in 08-recognition-review.md.
