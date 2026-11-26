# Current plan: upgrade, focused acceptance and deployment

Latest: the user has now tested0.4.7 on Huawei and iPhone. [0.4.8 phone fixes and retest](PHONE-FEEDBACK-0.4.8.md) supersedes the old installation status below. Retain the same candidate branch; expected package0.4.8. The broader staged acceptance plan remains.

26 November2026, Beijing time. [中文](../NEXT-STEPS.md) · [Full48-item backlog](BACKLOG.md)

The user now authorizes upgrading whenever useful; the earlier instruction to stay on0.4.6 is superseded. The user has run0.4.7 experience builds on Huawei and iPhone. The0.4.8 fixes still need an updated experience build and acceptance. Use `fix/recognition-acceptance-0.4.7` first and consider normal-main promotion after the core native flows pass. Team merges and production deployment remain separate.

## Update the existing Windows project

Run in PowerShell. This block preserves local edits by stopping before checkout, and stops at the first failed native command. It does not automatically stash, reset or delete user files.

```powershell
& {
    $ErrorActionPreference = 'Stop'
    Set-Location 'C:\Workspace\bird-assistant\bird-assistant-miniprogram'
    function Run-BirdStep {
        $program = $args[0]
        $arguments = $args[1..($args.Count - 1)]
        & $program @arguments
        if ($LASTEXITCODE -ne 0) { throw "Stopped: $program $arguments" }
    }
    $birdChanges = @(git status --porcelain)
    if ($LASTEXITCODE -ne 0) { throw 'Could not check the repository.' }
    if ($birdChanges.Count) { $birdChanges; throw 'Local changes found; preserve them and share this output.' }
    Run-BirdStep git fetch origin
    Run-BirdStep git switch fix/recognition-acceptance-0.4.7
    Run-BirdStep git pull --ff-only origin fix/recognition-acceptance-0.4.7
    Run-BirdStep npm.cmd ci
    Run-BirdStep npm.cmd run setup
    Run-BirdStep npm.cmd run verify
    Run-BirdStep node -p "require('./package.json').version"
}
```

Expected:229 client tests pass and version0.4.8. Then click **Compile/编译** in the existing WeChat DevTools project. Setup preserves the existing AppID; real login/device tests require the real project AppID and developer access. Keep existing drafts, journals and media for recovery tests; do not clear app storage first. Reuse the current acceptance pack. The normal path uses public HTTPS; the old WSL/individual-GPU SSH helper is not a required startup step. These PowerShell instructions were reviewed against the repository's commands; they were not executed on the user's Windows machine here.

## Work in small batches

Stop at a meaningful failure, record what happened and patch/retest that flow. Do not repeat already-confirmed registration as a substitute for testing the remaining identity lifecycle. Additional feedback is added to the queue.

| Batch | Check | Evidence/dependency |
| --- | --- | --- |
| A: identification UI/materials, start now | Equal visual/audio explanation heights; compact picker and conditional fallback; unclipped cards/filenames; photo/audio/both selection; review spacing/natural ratio/transparency/local EXIF. | Local UI, no model needed. Use04/05/06; do not start recognition yet. |
| B: posting/drafts | Square deck/full-image preview/per-photo parameters; two photos and one saved journal; save, leave, restart, reopen. Then9 visuals/3 journals, repeated saves, missing files and low-space recovery. | Local composer/drafts first. Multi-image server preview/upload/moderation needs the companion gallery deployment. |
| C: map/forum/profile | Drawer margins, dynamic1–3-row search, first marker taps/zoom, deep species tabs/comparison, photo flips, independent reactions, avatar/crop/cancel/restart and consultation history. | Local/read-only features first; interactions/global sorting depend on actual deployed business capabilities. |
| D: journal/Qwen, independently | Local selection/crop/proportions/undo/autosave/reopen/PNG export; then1–4 own photos→editable journal→preview/apply/undo; forum writing with fact boundaries. | Local editor is independent of AI. Real Qwen needs business identity/configuration and **does not need to wait for YOLO recovery**. |
| E: real models/advice/speech | Clear04, multiple/no-bird05/cancel/exit; live/multiple targets/background; real calls plus controls; named destinations/weather/season/habitat/citations/history; corrected mixed-language ASR confirmed once. | Gate each service separately. Test native GPS and campus Wi-Fi, off-campus Wi-Fi and mobile data. |
| F: device support/polish | Available phones/desktop WeChat/tablets, safe areas/keyboard/rotation/split-screen/resizing, then shared motion/feedback. | Stabilize core behaviour before visual polish. |

## First feedback batch only

1. Open Identify and expand both visual and audio explanations. Compare height/padding when both descriptions occupy two lines.
2. Import `media/04-Tree-Sparrow-EXIF.jpg`, `05-no-bird-control.png` and `06-校园西侧清晨录音-长文件名显示与回听控制样本.wav`. Confirm complete cards/actions, filenames and both photos selected initially. Switch photo/audio/both; deselecting one photo must change that photo's border only.
3. Review04: natural aspect ratio, no solid backdrop, comfortable field/button spacing. File metadata should include NikonD5100/ISO800/600mm/f6.3/1/50s, separate from author input. Unknown fields remain unknown; current GPS/time must not fill a historical photo.

Return three useful screenshot groups: expanded explanations, imported deck/modes and04 review. Text feedback is enough for other small changes. Fix/pass A before moving to B.

Pack audio06/07 are silence controls, useful for filenames/playback/unknown/false-positive checks, not genuine bird-call accuracy. The licensed real bird recordings used in the separate local report were not redistributed in this pack.

## Infrastructure track and gates

At08:49:05 Beijing the read-only public check still returned vision502/audio404. The infrastructure maintainer must inspect active Caddy/upstream processes/tunnels/models; web-admin credentials do not establish SSH/GPU access. This workflow still owns client fixes, Qwen business code and companion implementation/validation preparation.

| Service | Gate before live acceptance |
| --- | --- |
| Vision | Public readyz200 with real models ready, then valid image/live results; no personal laptop/WSL dependency. |
| Business/gallery/advice | Current service and all moderation assets deployed; gallery9/3 capability, new global sorting and evidence-schema5 advice use the shared identity. |
| Qwen writing/photo journal | Existing session, Mainland model/key/quota configured; real suggestions remain previewed/editable before application. Evaluate separately from GPU availability. |
| Bird calls | Real BirdNET/catalog, shared mobile signing, process/proxy/allowlists, public audio readyz200, then actual native uploads. |
| Human ASR | Maintainer confirms Mainland model access and enables the default-off setting; real WAV, mixed language/corrections/cancellation/confirmed append pass. |

Next development prioritizes defects found in A/B and complete core/account/profile recovery. Forum audio/short video follows with validation, storage, transcoding, playback, moderation, withdrawal/export and recovery;10s video/60s audio remain proposed product limits. Outside-community retrieval and cross-device history follow; footprints remain optional. Deploy the existing FastAPI responsibilities first and assess additional cloud functions only for an actual remaining need.
