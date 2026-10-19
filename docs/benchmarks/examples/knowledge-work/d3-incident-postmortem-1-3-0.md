# Incident postmortem

Knowledge work benchmark · Nightshift 1.3.0 · Sep 28, 2026 · Operations · job `job_mul0kr2008`

**[Replay this night in 3D ↗](https://meterless.ai/Benchmarks/KnowledgeWork/nights/D3-incident-postmortem_1.3.0/index.html)** · [Read it on the Morning Desk ↗](https://meterless.ai/Benchmarks/KnowledgeWork/) · [All examples](README.md)

> A blameless postmortem from a raw incident log and chat timeline.

| Judge score | Winning model | Drafts raced | Drafts judged | Unattended | Words |
|---|---|---:|---:|---:|---:|
| 0.85 | Qwen2.5 14B | 6 | 3 | 22 min | 711 |

**Verified against the answer key**

- 26 of 27 checklist facts
- Root cause right: the db.pool.max → db.pool.maxSize rename
- Why staging missed it: the load test ran on the default pool

**Proofs passed:** complete, not cut off; meets the length asked.

### The race

| Attempt | Lane | Model | Started | Finished | Tokens | Passed proofs | Judge | Kept |
|---:|---|---|---:|---:|---:|---|---:|---|
| 1 | generalist | Qwen2.5 14B | 0 min | 4.2 min | 1,199 | yes | 0.85 | **winner** |
| 2 | router | MiniCPM5 1B | 0 min | 6.5 min | 1,542 | no |  |  |
| 3 | generalist | Qwen2.5 14B | 4.2 min | 8.6 min | 1,301 | yes | 0.82 |  |
| 4 | verifier | VibeThinker 3B | 0 min | 20.2 min | 414 | no |  |  |
| 5 | vision | Qwen3.8 27B | 0 min | 21.3 min | 423 | no |  |  |
| 6 | router | MiniCPM5 1B | 21.3 min | 21.7 min | 852 | yes | 0.18 |  |

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

### Incident Postmortem: Incident #4471

#### Summary
On September 18, 2026, at 14:02 UTC, a deployment of the `payments-api` service, version 5.12.0, led to a significant increase in error rates, primarily due to `ConnectionPoolTimeout` errors. The incident began impacting users at 14:09 UTC, with an error rate of 7.8%. The rollback to version 5.11.4 was completed at 14:27 UTC, returning the error rate to 0.4%. Approximately 2,940 checkout attempts failed between 14:03 and 14:27 UTC. Around 61% of these customers were able to retry their transactions successfully within the hour.

#### Customer Impact
- **Error Rate**: 7.8% at peak, down to 0.4% post-rollback.
- **Failed Checkout Attempts**: 2,940 between 14:03 and 14:27 UTC.
- **Support Tickets**: 212 tickets logged about failed checkout attempts.
- **Estimated Unrecovered GMV**: ~$48,300.

#### Timeline (UTC)
- 14:02: `payments-api` v5.12.0 deployed to 100% without a canary phase.
- 14:09: Error rate spikes to 7.8%.
- 14:11: On-call engineer acknowledges and begins investigation.
- 14:15: Root cause identified as misconfigured `ConnectionPoolTimeout` due to a change in the pool size configuration key.
- 14:21: Rollback initiated to `payments-api` v5.11.4.
- 14:27: Rollback complete, error rate returns to normal.
- 14:40: Support team reports 212 tickets related to the incident.
- 15:05: Incident declared resolved; ~2,940 failed checkout attempts identified.
- 15:30: Finance estimates unrecovered GMV at ~$48,300.

#### Root Cause
The root cause was a configuration change that resulted in incorrect pool size settings due to a change in the configuration key from `db.pool.max` to `db.pool.maxSize`. This change was not properly flagged as breaking in the changelog, and the default pool size was not adequate for production loads.

#### Contributing Factors
1. **Configuration Change Not Properly Documented**: The configuration key was changed without proper documentation or flagging in the changelog as a breaking change.
2. **Canary Deployment Skipped**: The deployment process had a manual bypass for canary deployments using the "hotfix" label, but this bypass was used inappropriately for this non-emergency deployment.
3. **Load Testing Inadequate**: The staging environment uses default pool sizes, which did not reveal the issue during load testing.
4. **Dashboard Alerting Insufficient**: The existing alerting mechanism did not detect the pool-saturation issue, which is critical for identifying potential performance bottlenecks.
5. **Manual Process for Emergency Deployments**: The manual process for bypassing the canary phase was not enforced rigorously, leading to the inappropriate bypass for this deployment.

#### What Went Well
- Rapid identification of the root cause by the on-call engineer.
- Immediate rollback of the deployment to restore service.
- Effective communication with the support team to manage customer inquiries.

#### What Went Poorly
- Inadequate documentation and communication around breaking changes in the configuration keys.
- Lack of proper load testing in staging to catch configuration issues.
- Insufficient alerting on critical metrics such as pool saturation.
- Inappropriate use of the emergency deployment bypass label.

#### Action Items
| Action | Type | Owner Role | Priority | Due Date |
|--------|------|------------|----------|----------|
| **Update Changelog Guidelines** | Prevent | Product Manager | P0 | 2 weeks |
| **Enforce Canary Phases for All Deployments** | Prevent | Deployment Manager | P0 | 2 weeks |
| **Implement Automated Canary Tests** | Detect | QA Engineer | P1 | 1 month |
| **Enhance Dashboard Alerting for Critical Metrics** | Detect | DevOps | P1 | 1 month |
| **Review and Update Emergency Deployment Policy** | Prevent | Deployment Manager | P1 | 1 month |
| **Conduct Retrospective Training on Breaking Changes** | Prevent | Training Manager | P2 | 2 months |

#### Lessons
1. **Thorough Documentation**: Ensure that all breaking changes are properly documented and flagged in the changelog.
2. **Consistent Load Testing**: Conduct comprehensive load testing that reflects production configurations to catch potential issues.
3. **Robust Alerting**: Enhance monitoring and alerting for critical metrics to detect and mitigate issues early.
4. **Strict Emergency Deployment Policy**: Review and enforce a strict policy for emergency deployments to prevent misuse of bypass mechanisms.
5. **Continuous Learning**: Regularly review and update training materials to ensure all team members are aware of the importance of thorough testing and documentation.

This incident highlights the importance of rigorous testing, clear documentation, and robust monitoring to prevent and detect issues early, thereby minimizing customer impact.
