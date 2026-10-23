# Candidate backlog and open decisions

The following ideas remain part of the product discussion. They are not discarded and are not part of the 19-card proposed scope. Each needs its own card and prototype design if promoted into the submitted scope.

| ID | Candidate | Required design | Main dependency |
| --- | --- | --- | --- |
| ID-03 | Short video identification | Input preview, chosen frames and audio evidence, conflicting candidates and result review. | Clip limits, frame selection, audio association and phone upload remain unverified. |
| LIVE-01 | Continuous camera assistance | Detection overlay, stable hint, capture and fallback to a still image. | Phone camera and inference chain; detection and species classification are separate capabilities. |
| SOC-02 | Private and group conversations | Conversation lists, thread, participants and composing states. | Messaging infrastructure, group permissions, notifications and history need separate scope. |
| BADGE-01 | Badges and progress | Badge list, explanation and earned/unearned states. | Choose meaningful, verifiable rules; personal statistics must keep a defined basis. |
| WEATHER-01 | Automatic observation weather | Request service data, show source/time, review and override. | Historical weather availability, cost and location/time matching are unknown. |
| PHOTO-01 | Batch photo organisation | Import, proposed groups, representative selection and manual corrections. | Desktop-oriented competitor ideas require feasibility testing for mini-program files and storage. |
| PLAN-01 | Outing planning and preparation | Place comparison, available time, route and saved preparation materials. | Candidate from the team vision; demand, data and route capabilities still need validation. |
| OFFLINE-01 | Persistent offline recording and sync | Local pending queue, later upload, retry and conflict states. | Requires durable local storage and a synchronisation contract; session retention does not establish this. |
| LEARN-01 | Learning and community species review | Reference comparisons, suggested corrections and an owner review step. | Learning value, trustworthy reference data and reviewer authority need definition. |

## Proposed decisions to review

| Topic | Proposal | Still to decide |
| --- | --- | --- |
| Collection default | Propose a species grid, an unresolved group and linked encounter records. | Decide whether albums need equal prominence. |
| Map initial view | Propose one park or neighbourhood in view; retain search and manual movement. | Tune scale on the phone prototype rather than fixing an arbitrary zoom now. |
| Place and region | Keep visual clustering, stable places and regional boundaries separate. | Issue 5 should establish provider, data sources and useful named areas. |
| Friend relationship | Propose mutual requests for the story design. | Choose mutual friendship or following before treating this as a release requirement. |
| Public copies | Propose a previewed subset per destination and explicit updates. | Agree edit, deletion and attachment-access rules with the backend owner. |
| Sensitive location | Expose a disclosure decision before publication. | Team policy and implementation are unresolved; do not promise precise protection yet. |
| Identity and storage | Use a simulated account and session data for the upcoming prototype. | Real authentication, media storage and durable saves remain technical decisions. |

## Sources

**Course submission screenshot**

需求文档＋原型设计, due 2026-10-25 23:59 Asia/Shanghai. Requires story map/cards, priorities, implementation difficulty and prototype design for each story, plus group architecture and iteration planning.

**Issue 3**

https://github.com/bird-assistant/bird-assistant/issues/3

**Issue 4**

https://github.com/bird-assistant/bird-assistant/issues/4

**Team workflow**

https://github.com/bird-assistant/bird-assistant/blob/main/README.md

**First meeting**

https://github.com/bird-assistant/bird-assistant/blob/main/docs/第一次会议纪要.md

**Team vision**

https://github.com/bird-assistant/bird-assistant/blob/main/docs/观鸟助手_项目愿景与功能蓝图.md

**Recognition issue**

https://github.com/bird-assistant/bird-assistant/issues/6

**Recognition PR**

https://github.com/bird-assistant/bird-assistant/pull/7; inspected head 1b47109752fe91a31fa184c0dca04f706c504d31, open and unmerged when checked on 2026-10-22.

**User design discussion**

Five-tab portrait layout and map, collection, recognition, forum and profile brainstorm supplied on 2026-10-22. Acceptance details and priorities below are proposals, not survey findings.

## Added source-data candidates

| ID | Candidate | Required design | Dependency |
| --- | --- | --- | --- |
| REF-01 | Multiple reference sources | Retrieve species facts, permitted media and related observations; label source/version, duplicate origins, availability and disagreement. | Investigate provider access, taxonomy alignment and source-specific scores with issues 5/6; do not count mirrored records as independent support. |
| DATA-01 | Reviewed community reference library | Separate user-selected labels, community review and eligible reference examples; record reuse consent, source lineage and corrections. | Define reviewers, quality checks, consent and correction/removal from the reference index. Retrieval is separate from any later training dataset or model update. |

BADGE-01 also includes the proposed bird garden: record/learn → feather leaves → decorations. It remains a candidate without implemented points or gameplay.
