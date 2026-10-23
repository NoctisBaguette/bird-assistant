# Candidate and source comparison design v0.5

2026-10-23. This is the English companion to the Chinese team draft. ID-04 is expanded without increasing the 19-story count; P32 brings the designed screen/state count to 28.

## User experience

1. Receive ranked candidates with specific sources and score meanings.
2. Open Compare species and sources to inspect submitted evidence against reference features.
3. See disconnected, unavailable or disagreeing sources while keeping available results.
4. Return to selection, correct a label, add evidence or save unresolved.
5. Retain the original sample candidates, scores and source scenario on the private record, independently of later label changes.

## Scores and evidence

Label model scores, image/audio similarity and validated correctness probabilities separately. Do not automatically turn 0.78 into “78% accurate.” Do not average unrelated source scores or count copies of one photograph across databases as independent support. A reference feature is not a claim that the feature was detected in the input; do not invent an explanation without observable evidence.

## What the prototype actually provides

- Photo/audio candidates and scores are fixed interaction examples, without real inference.
- P32 contains manually curated text comparisons for two sparrows based on Cornell Lab pages, with original links. Reference photographs are not copied.
- Audio comparison explains that the synthetic sample is not a reference recording of the candidate species; no acoustic identification evidence is fabricated.
- Online search/external images and the community reference library are not connected. Clearly labelled review presets simulate source disagreement and unavailability.
- Public sharing, reference reuse and model training are separate choices; no real training or user-media reuse is added.
- Real reference retrieval, taxonomy alignment, deduplication, reviewer eligibility and training require separate implementation under REF-01 / DATA-01 and issues 5/6.

## Proposed reference-library rules

A user-selected label is not automatically a correct answer. Distinguish selection, community review and eligible reference examples, with quality and permission conditions. Keep source/version and correction/removal states in the retrieval index. Reference retrieval and training datasets are separate; deleting an index entry does not establish reversal of a model already trained on it.

## Submission scope and status

This revises product design and browser interaction, without claiming working models or database integration. Existing map/save/collection/publication rules remain. Chinese and English copies correspond. Competitor research remains the separate issue 4 task.

## Sources

- Guo et al., calibration and correctness probability: https://proceedings.mlr.press/v70/guo17a.html
- GBIF API reference data capabilities: https://techdocs.gbif.org/en/openapi/
- iNaturalist quality and media-licence rules inform the library discussion without adopting all of its policies.
- Sparrow reference notes: https://www.allaboutbirds.org/guide/Eurasian_Tree_Sparrow/id and https://www.allaboutbirds.org/guide/House_Sparrow/id

These support design and manually curated notes, not a claim of connected external services.
