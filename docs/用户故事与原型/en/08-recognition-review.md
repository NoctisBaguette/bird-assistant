# Candidate/source regression log v0.5

Environment: desktop Chrome, 414/360 px outer frames. Checks used UI actions without mutating internal application state.

| Check | Observed result |
| --- | --- |
| P12 candidates and P32 comparison × Chinese/English × both widths: 8 layouts | No horizontal content overflow. |
| Select second candidate → compare → change language → return | House sparrow remained selected and populated the save form. |
| Correct the label after private saving | The current label changed to Common kingfisher; original sparrow candidates, 0.78/0.61 sample scores and demo-photo-v1 remained. |
| Source disagreement | Explicit simulated model/retrieval disagreement; unresolved private saving and collection remained possible. |
| Unavailable reference | Simulated unavailability displayed; returning retained the model candidates. |
| No reliable candidates | Saved unresolved; retained assessment explicitly has no candidates or fabricated scores. |
| Audio analysis → comparison → unresolved save | Synthetic input is not presented as a species reference recording; retained demo-audio-v1 and 0.67/0.53 sample scores. Compact English comparison had no overflow. |
| Skip analysis + failed save/retry | Failure kept private count at 2; normal retry changed it to 3, with no fabricated analysis panel. |
| Independent unresolved private save | Private records 2→3; public map 2, posts 1 and selected species 1 stayed unchanged. |
| Console | No captured errors originating from the prototype page. |

These are concrete demo paths, not exhaustive acceptance coverage. Real inference, online reference retrieval, community-media reuse, probability calibration, native WeChat/mobile browsers and the complete local file-picker path remain unverified.

The v0.4 visual and central-circle checks are historical results; related styles remain without relabelling those checks as new tests. Source/offline checks are maintained with the prototype.
