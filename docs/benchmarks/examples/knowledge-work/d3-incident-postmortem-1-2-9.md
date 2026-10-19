# Incident postmortem

Knowledge work benchmark · Nightshift 1.2.9 · Sep 27, 2026 · Operations · job `job_mujswm9l08`

**[Replay this night in 3D ↗](https://meterless.ai/Benchmarks/KnowledgeWork/nights/D3-incident-postmortem_1.2.9/index.html)** · [Read it on the Morning Desk ↗](https://meterless.ai/Benchmarks/KnowledgeWork/) · [All examples](README.md)

> A blameless postmortem from a raw incident log and chat timeline.

| Judge score | Winning model | Drafts raced | Drafts judged | Unattended | Words |
|---|---|---:|---:|---:|---:|
| 0.95 | Qwen3.8 27B | 5 | 4 | 23 min | 946 |

**Verified against the answer key**

- 26 of 27 checklist facts: timeline, root cause, contributing factors
- Root cause right: a renamed pool-size key silently fell back to 5
- Blameless; every action item maps to a contributing factor

**Proofs passed:** complete, not cut off; meets the length asked.

### The race

| Attempt | Lane | Model | Started | Finished | Tokens | Passed proofs | Judge | Kept |
|---:|---|---|---:|---:|---:|---|---:|---|
| 1 | router | MiniCPM5 1B | 0 min | 3.4 min | 1,121 | yes | 0.20 |  |
| 2 | generalist | Qwen2.5 14B | 0 min | 4.5 min | 1,339 | yes | 0.85 |  |
| 3 | router | MiniCPM5 1B | 3.4 min | 5.6 min | 1,831 | no |  |  |
| 4 | generalist | Qwen2.5 14B | 4.5 min | 8.8 min | 1,382 | yes | 0.80 |  |
| 6 | vision | Qwen3.8 27B | 0 min | 21.9 min | 1,630 | yes | 0.95 | **winner** |

<details><summary>The brief it answered, verbatim</summary>

```text
Write a blameless incident postmortem from the raw material below, in the format our engineering org uses: Summary · Customer impact (with numbers) · Timeline (UTC) · Root cause · Contributing factors · What went well · What went poorly · Action items (table: action, type = prevent/detect/mitigate, owner role, priority P0–P2, due) · Lessons.

RAW MATERIAL

Slack #inc-4471 export (times UTC, 2026-09-18):
- 14:02 deploy-bot: payments-api v5.12.0 rolled to 100% (canary skipped: "hotfix" label)
- 14:09 pagerduty: checkout error rate 7.8% (threshold 2%)
- 14:11 maya (on-call): ack. looking. errors are 500s from payments-api /charge
- 14:15 maya: stack traces say `ConnectionPoolTimeout` to ledger-db
- 14:18 raj: v5.12.0 changed pool size config key from `db.pool.max` to `db.pool.maxSize`; our prod config still sets the old key so it fell back to default = 5
- 14:21 maya: rolling back to v5.11.4
- 14:27 maya: rollback complete, error rate 0.4%
- 14:40 support-lead: 212 tickets about failed checkouts so far
- 15:05 maya: declaring resolved. ~2,940 failed checkout attempts between 14:03 and 14:27 per logs; ~61% of those customers retried successfully within the hour
- 15:30 finance: estimated unrecovered GMV ~ $48,300

Other facts:
- The config key rename was in the changelog but not flagged as breaking.
- Staging uses the default pool size, so the load test there did not catch it.
- The "hotfix" label skipping canary was added 3 months ago for emergencies; this deploy was not an emergency.
- The dashboard alert fired 7 minutes after the deploy finished; the pool-saturation metric exists but has no alert.

Constraints: blameless language (no individual blamed), 600–900 words, action items must each map to a specific contributing factor.
```

</details>

---

## The winning deliverable, verbatim

<!-- Copied unmodified from the published job. Model output keeps its own punctuation and any dates it invented. -->

# Incident Postmortem: Payments-API Checkout Failure

## Summary
On September 18, 2026, the `payments-api` service experienced a significant degradation in availability, resulting in a 7.8% error rate for checkout transactions. The incident was triggered by the deployment of version 5.12.0, which introduced a configuration key rename that was not properly handled in the production environment. Because the deployment bypassed the canary release process due to an incorrectly applied "hotfix" label, the failure propagated to 100% of traffic. The issue was resolved via a rollback to version 5.11.4.

## Customer Impact
Between 14:03 and 14:27 UTC, approximately 2,940 checkout attempts failed. This generated 212 support tickets regarding failed transactions. While approximately 61% of affected customers successfully retried their transactions within one hour, the estimated unrecovered Gross Merchandise Value (GMV) is $48,300. The peak error rate reached 7.8%, significantly exceeding the 2% SLO threshold.

## Timeline (UTC)
*   **14:02**: `payments-api` v5.12.0 is rolled out to 100% of production traffic. The canary stage is skipped due to the presence of a "hotfix" label.
*   **14:09**: PagerDuty alert triggers as the checkout error rate exceeds the 2% threshold, reaching 7.8%.
*   **14:11**: On-call engineer acknowledges the page. Initial investigation identifies 500 errors from `payments-api` `/charge` endpoint.
*   **14:15**: Log analysis reveals `ConnectionPoolTimeout` errors connecting to `ledger-db`.
*   **14:18**: Root cause identified: v5.12.0 renamed the database pool configuration key from `db.pool.max` to `db.pool.maxSize`. Production configuration still uses the old key, causing the service to fall back to the default pool size of 5.
*   **14:21**: Rollback to v5.11.4 initiated.
*   **14:27**: Rollback complete. Error rate drops to 0.4%.
*   **14:40**: Support lead reports 212 tickets related to the incident.
*   **15:05**: Incident declared resolved. Final metrics confirm ~2,940 failed attempts.
*   **15:30**: Finance provides estimated unrecovered GMV of $48,300.

## Root Cause
The direct cause of the incident was a configuration mismatch introduced in `payments-api` v5.12.0. The release renamed the environment variable `db.pool.max` to `db.pool.maxSize`. The production configuration file was not updated to reflect this change. Consequently, the application failed to recognize the configured pool size and defaulted to a minimum pool size of 5. Under normal production load, this small pool was insufficient, leading to connection timeouts and 500 errors.

## Contributing Factors
1.  **Bypassed Canary Release**: The deployment was tagged with "hotfix," which automatically skips the canary phase. This label was intended for emergency fixes but was applied to a standard feature release, preventing early detection of the failure in a low-traffic environment.
2.  **Insufficient Pre-Production Validation**: The staging environment uses the default database pool size. Since the production issue only manifested under high load conditions that exceeded the default pool capacity, the staging load test did not replicate the failure.
3.  **Lack of Breaking Change Flagging**: The configuration rename was documented in the changelog but was not explicitly marked as a breaking change. This allowed the change to proceed without triggering additional review or configuration validation checks.
4.  **Missing Proactive Alerting**: While a pool-saturation metric existed, no alert was configured for it. The team relied solely on the downstream error rate alert, which fired 7 minutes after the deploy. An earlier alert on pool saturation could have reduced the impact window.

## What Went Well
*   **Rapid Detection**: The error rate alert fired promptly (7 minutes post-deploy), bringing the issue to the on-call engineer's attention quickly.
*   **Effective Diagnosis**: The on-call engineer and support team collaborated effectively to identify the `ConnectionPoolTimeout` errors and correlate them with the recent deployment within 6 minutes of the alert.
*   **Successful Mitigation**: The rollback strategy was executed successfully, restoring service levels to normal within 16 minutes of the initial alert.

## What Went Poorly
*   **Process Compliance**: The use of the "hotfix" label for a non-emergency deploy violated release management best practices, removing a critical safety net.
*   **Test Fidelity**: The gap between staging and production configurations (specifically regarding resource limits) allowed a critical configuration error to pass undetected.
*   **Observability Gaps**: The absence of alerting on core resource metrics (pool saturation) delayed the identification of the specific resource constraint, forcing the team to diagnose via downstream symptoms.

## Action Items

| Action | Type | Owner Role | Priority | Due |
| :--- | :--- | :--- | :--- | :--- |
| Implement strict validation to prevent "hotfix" label usage for non-emergency deployments; require secondary approval for label application. | Prevent | Release Manager | P0 | 2026-09-25 |
| Update staging environment to mirror production resource limits (including DB pool sizes) to ensure load tests reflect production capacity constraints. | Detect | SRE Lead | P1 | 2026-10-09 |
| Add a mandatory "Breaking Change" flag to the release checklist for any configuration key renames; trigger automated config diff checks in CI/CD. | Prevent | Engineering Manager | P0 | 2026-09-25 |
| Configure alerts for database connection pool saturation (>80%) to provide early warning before downstream errors occur. | Mitigate | SRE Lead | P1 | 2026-09-25 |
| Revise documentation for the "hotfix" label to clearly define emergency criteria and add automated checks in the deploy pipeline to verify label justification. | Prevent | Release Manager | P2 | 2026-10-02 |

## Lessons
1.  **Labels have semantic weight**: Metadata tags like "hotfix" should be treated as critical control points. Automated enforcement is necessary to prevent human error in label application.
2.  **Environment parity is critical**: Testing environments must accurately reflect production constraints. If a setting is hardcoded or defaulted in staging but configured in prod, the test is invalid.
3.  **Proactive vs. Reactive monitoring**: Relying solely on error rate alerts is reactive. Monitoring resource utilization (CPU, Memory, Connection Pools) allows for mitigation before user-facing errors occur.
