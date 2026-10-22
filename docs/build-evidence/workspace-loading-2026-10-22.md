# Workspace loading — 22 October 2026

The prior UX release still left expensive first navigation: the editor used seven PostgREST reads over three sequential stages, and the guest page separately fetched wedding and live version before its report. All workspace link prefetching was disabled. A save pending at departure also forced a full document navigation.

This change embeds draft/grant/entitlement/current publication through existing foreign keys under the caller's RLS. Editor reads become three requests in one parallel stage after verified auth. Guest context becomes one joined read followed by its authorized report (two rather than three data round trips). No migration, service key, shared private cache or skipped user verification.

Only the current wedding's guest route is fully prefetched; editor routes are deliberately fetched fresh to avoid replaying an older draft. Successful publication refreshes the router cache. A prefetched report older than ten seconds revalidates in the background without locking controls. Dirty departure uses client navigation after the save acknowledgement, retaining prepared route data instead of reloading the document.

Verification: 273 tests / 31 files, typecheck, optimized QA build, real local PostgREST joins and the synthetic backend workflow passed. The local workflow also asserts that the guest server-rendered page contains its actual report UI, not a streamed query error. Subsequent live checks/timing samples are stored in ignored `.artifacts/client-handoff/`.

Limits: free Netlify serverless cold starts and client network latency still affect a first uncached visit. Background preparation improves normal navigation; this does not guarantee zero loading for a hard reload or a slow/offline connection. No paid plan or new service was enabled.
