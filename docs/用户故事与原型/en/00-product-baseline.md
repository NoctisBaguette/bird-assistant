# Bird Assistant product design baseline v0.5

2026-10-22. Prepared for issue 3 by Zhou Houlin and the project team. This package is proposed design for review. It does not freeze the team's MVP and does not report user-research findings.

## Purpose

We are designing the path from finding a place to keeping evidence and choosing whether to share it. The five-tab portrait layout follows the user's brainstorm. The team's confirmed platform is a WeChat mini-program; detailed technology and release scope remain open.

There are 19 proposed story cards. Each maps to a specific screen outline and acceptance conditions. Live camera recognition, short video, conversations and other broader ideas remain in a candidate backlog. If any candidate is promoted into the submitted story set, add its card, screen design and traceability row before claiming full coverage.

Priority expresses proposed user value. Difficulty expresses implementation uncertainty. Planned prototype coverage expresses what we need to design; none of these is evidence that a feature is implemented.

## Shared rules

### G01 Navigation

Main tabs remain Home, Collection, Identify, Discussion and Profile, with a larger central Identify button. Focused capture and editors may use Back and a task footer; returning restores the prior main-tab state.

### G02 Private ownership

A saved observation is private by default. Joining a collection, publishing a map contribution and publishing a forum post are independently controlled uses of that evidence.

### G03 Publication copies

Proposed rule: a publication contains only the fields/media selected in its preview. Editing a private source does not silently expose new fields; the owner reviews updates to public copies. Final data representation is a backend decision.

### G04 Identification state

Preserve evidence, model suggestions and the user-selected label separately. User selected, unresolved, community suggested and expert reviewed are not interchangeable labels.

### G05 Counting

Count observation records, user-selected species from personal observations and bookmarks separately. Unresolved observations, unselected model candidates and saved content from other users do not increase personal observed-species totals.

### G06 Location and time

Observation time differs from upload time. Missing values remain unknown. Display clustering differs from a lasting place and from the regional boundary used for a collection.

### G07 Access and anonymity

Public anonymity hides attribution and identity links while retaining internal ownership. Private collection access is not granted merely by being friends. Location disclosure requires a separate choice.

### G08 Drafts and errors

Keep selected evidence and entered content through recoverable errors. Distinguish cancellation, missing permission, invalid input, no reliable result, analysis failure and save/publish failure.

### G09 Prototype evidence

Prototype results, map data, identity and social actions are simulated. A screen outline establishes planned design coverage only; it establishes neither implemented behaviour nor phone performance.



### G10 Reference reuse

Public sharing, reference-library reuse and model training are separate purposes. Only eligible, permitted evidence enters the reference index. A user-selected or model-suggested label does not automatically become a reviewed example. Preserve provenance and deduplicate mirrored evidence.

## Technical evidence

Issue 6 and PR 7 establish a useful desktop experiment, not a complete mini-program recognition service. Visual species coverage, phone execution and end-to-end latency remain unresolved. Five successful clean audio clips are a limited feasibility result. The 22 October 2026 review of the supplied CSV/evaluator snapshot found that its evaluator excludes zero-detection frames: counting all reference-positive frames changes 188/291 to 188/368, or 64.6% to 51.1%. This is agreement with another detector, not manually labelled accuracy. The design therefore retains unresolved and failure outcomes and sets no fixed recognition speed or success guarantee.
