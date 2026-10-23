# Bird Assistant Competitor Review

2026-10-23 · Issue 4 · v0.2

## Conclusion and scope

Existing products already cover identification, private lists, map sightings, community identification and photo culling. We propose validating one coherent mini-program journey: explore a place, retain personal evidence, review candidates and separately choose collection and public uses. Individual features, Chinese support and WeChat access do not establish uniqueness.

This review follows the nine dimensions in issue 4. It retains domestic comparisons and adds a growth reference: 8 products cover the 5 suggested categories. The purpose is to narrow requirements and prototype choices, without committing batch culling or a game to the first release.

Sources were checked on 23 October 2026. Features come from official sites, help pages and developer listings. Assessments, borrowing ideas and possible differences are design analysis. Workflow numbers count reconstructed task stages, excluding initial setup; apps were not installed or timed, so these are not tap counts or usability rankings.

## Product overview

| Product | Category |
| --- | --- |
| Merlin Bird ID | Photo and sound identification |
| 懂鸟 AboutBirds | Domestic identification and personal reference |
| BirdNET App | Bird sound identification |
| eBird | Observation records and sighting discovery |
| iNaturalist | Nature observations and community identification |
| 中国观鸟记录中心 | Domestic bird records and queries |
| 慧眼选鸟 SuperPicky | Bird photography culling |
| Seek by iNaturalist | Nature exploration and growth reference |

## Merlin Bird ID

**Target users**  Beginners and birdwatchers seeking help with a bird they see or hear. [M1]

**Core scene**  Identify in the field and explore species before or after an encounter. [M1]

**Three core functions**  Photo ID; Sound ID; species exploration and a personal list. [M1, M3]

**Workflow**  Photo route in 4 documented task stages: provide photo/context; compare candidates; select a bird; confirm date/place and save. These are reconstructed stages, not measured taps. [M1, M3]

**Data sources**  Identification models and reference material, with eBird observations informing locally likely species. [M1, M2]

**Strength**  Our assessment: several identification routes connect naturally to learning; the official overview documents offline photo and sound identification. [M1]

**Limits and open tests**  Sound coverage is region-dependent. A global guide does not imply global Sound ID. Saving a sighting requires a connection; saved personal sightings are already private. [M2, M3]

**What we can borrow**  Candidate comparison, reference access and confirmation. Our design should also let an uncertain user keep evidence without choosing a species.

**Possible difference**  Test how well unresolved records and separately chosen sharing destinations work together. Photo ID, Sound ID and private lists are established features.


## 懂鸟 AboutBirds

**Target users**  Birdwatchers seeking Chinese names, identification and personal bird records; audience inferred from the product description. [D1]

**Core scene**  Field identification and later review of personal material. [D1]

**Three core functions**  Offline photo/audio ID; species reference; private media and a life list. [D1]

**Workflow**  A 3-stage analytical outline only: provide evidence; inspect identification/reference; organize personal media. Published descriptions do not establish the actual screen sequence.

**Data sources**  The developer describes recognition, species reference and list imports from eBird and China Bird Report. Training-data composition is not established here. [D1]

**Strength**  Our assessment: a direct domestic comparator already combines identification, Chinese reference and personal accumulation.

**Limits and open tests**  The iPhone description calls it an offline version of the mini-program. App/mini-program parity and local recognition performance need testing. [D1]

**What we can borrow**  Consistent bird naming, reference beside identification and easy retrieval of personal evidence.

**Possible difference**  Test the campus encounter, candidate review and sharing controls. Chinese, WeChat access and multiple input modes alone are not unique positioning.


## BirdNET App

**Target users**  People identifying bird sounds and observers contributing recordings. [B1]

**Core scene**  Record in the field and inspect suggested species. [B1]

**Three core functions**  Audio capture; species suggestions and scores; optional observation contribution. [B1]

**Workflow**  The official page describes 4 stages: record; analyze; receive suggestions; optionally contribute. This is not a four-tap measurement. [B1]

**Data sources**  User recordings and the BirdNET neural network; the project page describes location as optional. [B1]

**Strength**  Our assessment: the focused audio task is a useful reference for recording, replay and result review.

**Limits and open tests**  Project and store pages use different coverage descriptions. Do not transfer these to a particular installed version, or conflate App, Live and Analyzer. Noise and local species remain untested. [B1, B2]

**What we can borrow**  Visible recording state, replay, analysis feedback and revisitable results. Label score source and meaning rather than displaying an unvalidated correctness probability.

**Possible difference**  Keep recordings and original suggestions linked to personal observations, permit later corrections and retain evidence after recognition failure.


## eBird

**Target users**  Birdwatchers keeping records, finding places and contributing observation data. [E1, E2]

**Core scene**  Explore before an outing, keep a checklist during it and review afterwards. [E1, E2]

**Three core functions**  Checklists; regional/hotspot exploration; personal observation summaries. [E1, E2]

**Workflow**  A configured checklist task in 4 stages: start and enter species/counts; confirm place; stop and review effort; submit. Account and pack setup are separate. [E1]

**Data sources**  Community checklists; Explore also connects Macaulay Library media and Merlin identification material. [E1, E2]

**Strength**  Our assessment: linking species to place, time and effort makes a visit more interpretable than a list of names alone.

**Limits and open tests**  Completeness and effort may need beginner guidance, a hypothesis to test. Unsubmitted lists can remain on the phone; that is not account synchronization. [E1]

**What we can borrow**  Separate observation/upload time, date historical sightings and distinguish a device draft from a synchronized record.

**Possible difference**  Start with a small private encounter, then offer completion and sharing. Hotspot maps and species totals already have strong precedents.


## iNaturalist

**Target users**  Nature observers seeking or providing identification help, beyond birds. [I1, I2]

**Core scene**  Document an encounter and follow later suggestions, discussion and identifications. [I1]

**Three core functions**  Evidence-bearing observations; AI match comparison; community identification and discussion. [I1, I2]

**Workflow**  New iPhone AI-camera route in 5 stages: capture; review matches; save locally; optionally edit/upload; follow identifications. Saving and uploading are explicitly distinct. [I1]

**Data sources**  User observations and identifications build the community record; recognition models draw on community-verified observations. [I2, I4]

**Strength**  Our assessment: candidates and community identifications can be revisited. Quality grades have rules; choosing an AI suggestion is not expert verification. [I3]

**Limits and open tests**  Uploaded observations are public; hiding coordinates does not hide the observation. The newer app can retain unuploaded local records, so it is inaccurate to say private saving is entirely absent. [I1, I5]

**What we can borrow**  Separate raw evidence, model candidates, user choice and community input; explain record visibility separately from location visibility.

**Possible difference**  Test understandable independent controls for collections, map contributions and forum posts. Private saving and match comparison are not novel by themselves.


## 中国观鸟记录中心

**Target users**  Birdwatchers submitting and querying observations in China. [C1, C2]

**Core scene**  Look up reports and document personal observations during or after an outing. [C1, C2]

**Three core functions**  Observation reports; region/species queries; observation statistics. [C1]

**Workflow**  A 4-stage outline from submission rules: establish date/place; enter personal species/counts; add or later supplement evidence; review/submit. Mini-program screens and taps remain unmeasured. [C2]

**Data sources**  Users’ own seen/heard observations and evidence from the matching encounter. [C2]

**Strength**  Our assessment: domestic recording rules are directly relevant; the official site also provides WeChat mini-program access or guidance. [C1]

**Limits and open tests**  Website rules are not a screen-by-screen specification of the mini-program. Navigation, permissions, error recovery and private organization need a walkthrough.

**What we can borrow**  Separate personal observations from others’ media, allow later evidence and explain date/place; ordinary species records also matter. [C2]

**Possible difference**  Test quick unresolved capture followed by completion and sharing. Domestic record platforms and a WeChat entry point already exist.


## 慧眼选鸟 SuperPicky

**Target users**  Bird photographers sorting large batches after shooting; explicitly named in issue 4. [S1, S2]

**Core scene**  Post-outing photo selection, comparison and organization. [S2]

**Three core functions**  Bird-photo quality suggestions; burst grouping; filtering, comparison and manual rating. [S1, S3]

**Workflow**  A 4-stage reconstruction: select a folder; configure/run analysis; inspect groups/ratings; review and organize results. No installed timing or tap measurement. [S2, S3]

**Data sources**  User images, vision models and camera information; a GBIF-derived rarity indicator is separate from conservation status. [S1, S2, S4]

**Strength**  Our assessment: head sharpness and burst review address a concrete post-shoot task while retaining manual selection. [S2, S3]

**Limits and open tests**  This is desktop software. Workflow evidence uses the 4.5.0 guide while the homepage advertises a newer release. Folder, RAW and metadata operations need separate mini-program feasibility work. [S1, S2]

**What we can borrow**  Later compare photos within an encounter and select a representative, explain suggestions and allow changes. Avoid automatic original-file moves or deletion in the first release.

**Possible difference**  Link a small evidence set to an encounter. Keep batch culling in PHOTO-01. A documented rarity indicator is not a ready-made basis for growth rewards.


## Seek by iNaturalist

**Target users**  Beginners exploring nature and families. [K1, K2]

**Core scene**  Recognize organisms while exploring and revisit collection/challenge progress. [K1, K2]

**Three core functions**  Live camera identification; local observations; badges and challenges. [K1, K2]

**Workflow**  A 4-stage task outline: open camera; inspect identification; add an observation; see progress. Badge triggers and exact taps need testing. [K1, K2]

**Data sources**  Models draw on iNaturalist/partner community data; the local model is generally older than the online one. [K1, K2]

**Strength**  Our assessment: progress can support learning without requiring public posting; ordinary use does not require an account. [K2]

**Limits and open tests**  Local AI output is not community review. Distinguish ordinary device-local use from optional sign-in and posting to iNaturalist. [K2]

**What we can borrow**  Keep progress independent of social sharing. Our future rules can value ordinary birds and learning from unresolved encounters.

**Possible difference**  Test garden decorations for notes, added evidence and learning similar species. Keep BADGE-01 optional; do not require rare-species chasing or exact-location publication.

## Design recommendations

### R1 Keep candidate comparison and unresolved saving

ID-04 / P12 / P32  Users should inspect references, retain original suggestions and choose or correct a label. Store scores independently from user choice; do not average unrelated sources.

### R2 Show interpretable dated observations on the map

MAP-01 / MAP-02  Show observation date/place and preserve map/detail context. The real provider still depends on issue 5; a historical sighting is not a live bird location.

### R3 Validate private saving and independent public uses

G02 / G03 / G07  Expose distinct states for private observations, collections, map contributions and forum posts. Preview published fields; distinguish location privacy from whole-record visibility.

### R4 Decide reference retrieval, review and model training separately

REF-01 / DATA-01 / G10  Accessible reference material is not automatically reusable media. Retain provenance, permission and review state. A selected label is not a reviewed example; test real integrations separately.

### R5 Keep batch photo culling in the candidate backlog

PHOTO-01  First evaluate comparing a small evidence set and choosing a representative. Bulk RAW, folder moves and metadata writes need separate feasibility work and are not implemented in the current prototype.

### R6 Validate learning feedback before expanding the mini-game

BADGE-01  Propose feathers/leaves or garden decorations for notes, added clues and learning similar species. Keep rewards separate from publishing and handle duplicates/withdrawals. No accuracy or retention improvement has been demonstrated.

## Follow-up validation

**U1 Find a local outing**  Ask a target user to open a dated map record and return; check whether they assume the bird is still there.

**U2 Finish without knowing the species**  Provide an unclear image or unreliable sound result; observe unresolved saving, evidence addition and later retrieval.

**U3 Understand two scores**  Show suggestions from different sources; ask whether scores imply correctness probability and what the user does after disagreement.

**U4 Private saving and publishing**  Save privately, publish to one destination, ask who can see which fields, then withdraw and check again.

**U5 Test the growth idea**  Compare small growth sketches for notes, learning and collecting; record choices and reasons without assuming better retention.

**U6 Check direct domestic comparators**  Have the team run the same task in Dongniao and China Bird Report in WeChat; record version, date, steps, permissions and recovery.

## Evidence limits

Mainland network availability, WeChat permissions, inference latency, target-species accuracy, battery and storage were not measured. Published feature descriptions do not establish those results.

Version differences matter: BirdNET project/store coverage descriptions differ; the SuperPicky landing page is newer than the cited tutorial. Do not merge coverage totals or transfer guarantees across interfaces or versions.

Some eBird main-site pages restricted automated retrieval, so accessible official help supplies the workflow evidence. Dongniao’s main page yielded no readable body; feature claims rely on its developer listing. Unperformed mini-program walkthroughs remain open.

## Sources

- [T1] [Issue 4 竞品调研与九个维度](https://github.com/bird-assistant/bird-assistant/issues/4)
- [T2] [团队 README 与任务分支流程](https://github.com/bird-assistant/bird-assistant/blob/main/README.md)
- [M1] [Merlin 官方产品概览](https://www.merlinbirds.org/)
- [M2] [Merlin 官方 FAQ](https://support.ebird.org/en/support/solutions/articles/48000961587-merlin-bird-id-faqs)
- [M3] [Merlin 保存观察说明](https://support.ebird.org/en/support/solutions/articles/48001144489-saving-birds-identified-with-merlin)
- [D1] [懂鸟 开发者 App Store 产品说明](https://apps.apple.com/cn/app/%E6%87%82%E9%B8%9F/id6738765188)
- [B1] [BirdNET 项目 App 介绍与流程](https://birdnet.cornell.edu/app/)
- [B2] [BirdNET 开发者 iOS 产品说明](https://apps.apple.com/cy/app/birdnet/id1541842885)
- [E1] [eBird Mobile 记录流程](https://support.ebird.org/en/support/solutions/articles/48000957940)
- [E2] [eBird 区域与热点探索](https://support.ebird.org/en/support/solutions/articles/48001255129-explore-regions-in-ebird)
- [I1] [iNaturalist 新 iPhone App 观察流程](https://help.inaturalist.org/en/support/solutions/articles/151000197160-how-to-make-an-observation-with-inaturalist-next)
- [I2] [iNaturalist 与 Seek 对照](https://help.inaturalist.org/en/support/solutions/articles/151000169914-what-is-the-difference-between-inaturalist-and-seek-by-inaturalist-)
- [I3] [iNaturalist 数据质量评估](https://help.inaturalist.org/en/support/solutions/articles/151000169936-what-is-the-data-quality-assessment-dqa-and-how-do-observations-qualify-to-become-research-grade-)
- [I4] [iNaturalist 技术与社区确认资料](https://www.inaturalist.org/pages/technology)
- [I5] [iNaturalist 位置隐私说明](https://help.inaturalist.org/en/support/solutions/articles/151000169938-what-is-geoprivacy-what-does-it-mean-for-an-observation-to-be-obscured-)
- [C1] [中国观鸟记录中心 官网](https://www.birdreport.cn/)
- [C2] [中国观鸟记录中心 记录提交规则](https://www.birdreport.cn/home/notice/rule.html)
- [S1] [慧眼选鸟 官网](https://superpicky.app/)
- [S2] [慧眼选鸟 4.5.0 快速开始](https://superpicky.app/tutorial/450/01-quickstart)
- [S3] [慧眼选鸟 4.5.0 教程目录与结果浏览](https://superpicky.app/tutorial/450/)
- [S4] [慧眼选鸟 罕见度与保护等级说明](https://superpicky.app/tutorial/450/06-rarity)
- [K1] [Seek 官方产品介绍](https://www.inaturalist.org/pages/seek_app)
- [K2] [Seek 与 iNaturalist 功能和资料用途对照](https://help.inaturalist.org/en/support/solutions/articles/151000169914-what-is-the-difference-between-inaturalist-and-seek-by-inaturalist-)
