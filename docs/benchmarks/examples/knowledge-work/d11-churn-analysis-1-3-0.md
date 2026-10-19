# Churn cohort analysis

Knowledge work benchmark · Nightshift 1.3.0 · Sep 28, 2026 · Finance · job `job_mul0krkc0a`

**[Replay this night in 3D ↗](https://meterless.ai/Benchmarks/KnowledgeWork/nights/D11-churn-analysis_1.3.0/index.html)** · [Read it on the Morning Desk ↗](https://meterless.ai/Benchmarks/KnowledgeWork/) · [All examples](README.md)

> A one-page memo from a cohort retention table: what changed, why, and what to do.

| Judge score | Winning model | Drafts raced | Drafts judged | Unattended | Words |
|---|---|---:|---:|---:|---:|
| 0.95 | Qwen3.8 27B | 5 | 5 | 26 min | 961 |

**Verified against the answer key**

- 17 of 17 cohort retention figures match ground truth
- The Q3 anomaly flagged, with a significance check
- Cause named: onboarding, not the price change

**Proofs passed:** complete, not cut off; figures traced to the brief.

### The race

| Attempt | Lane | Model | Started | Finished | Tokens | Passed proofs | Judge | Kept |
|---:|---|---|---:|---:|---:|---|---:|---|
| 1 | router | MiniCPM5 1B | 0 min | 5.3 min | 391 | yes | 0.10 |  |
| 2 | generalist | Qwen2.5 14B | 0 min | 5.6 min | 1,264 | yes | 0.82 |  |
| 3 | router | MiniCPM5 1B | 5.3 min | 5.9 min | 575 | yes | 0.05 |  |
| 4 | generalist | Qwen2.5 14B | 5.6 min | 8.7 min | 914 | yes | 0.55 |  |
| 6 | vision | Qwen3.8 27B | 0 min | 24.9 min | 1,462 | yes | 0.95 | **winner** |

<details><summary>The brief it answered, verbatim</summary>

```text
Analyse this customer cohort table for the head of customer success and write a 1-page memo: what the retention curve says, which cohort is anomalous, the most likely explanations that the data can and cannot support, and three concrete next steps (each with the metric that would show it worked). Show your computed numbers in a small appendix table.

Logo retention: number of customers from each signup cohort still active at the end of month N.

| Cohort | Signed up | M1 | M3 | M6 | M9 | M12 |
|---|---|---|---|---|---|---|
| 2025-Q1 | 120 | 114 | 105 | 96 | 90 | 86 |
| 2025-Q2 | 140 | 133 | 121 | 110 | 103 | 98 |
| 2025-Q3 | 160 | 150 | 128 | 104 | 95 | — |
| 2025-Q4 | 150 | 143 | 131 | 119 | — | — |
| 2026-Q1 | 175 | 168 | 155 | — | — | — |

Known context: the self-serve onboarding flow was replaced by a new guided flow on 2025-07-01; pricing rose 12% for new customers on 2025-10-01.
Required: compute each cohort's retention % at every available month (one decimal), compare M6 across cohorts, and state which differences are big enough to matter given these cohort sizes (give a rough way to judge that, without over-claiming statistical significance).
```

</details>

---

## The winning deliverable, verbatim

<!-- Copied unmodified from the published job. Model output keeps its own punctuation and any dates it invented. -->

**MEMO**

**TO:** Head of Customer Success
**FROM:** Data Analytics Team
**DATE:** October 26, 2025
**SUBJECT:** Cohort Retention Analysis: Impact of Onboarding & Pricing Changes

### Executive Summary
Analysis of the last five signup cohorts reveals a clear inflection point in retention. The 2025-Q3 cohort exhibits a significant drop-off in Month 3 (M3) and Month 6 (M6) compared to historical baselines. This anomaly aligns temporally with the new guided onboarding flow (launched July 1, 2025) and the 12% price increase (effective October 1, 2025). While the Q3 cohort shows the highest initial volume, its mid-term retention is the weakest, suggesting friction in the new onboarding or price sensitivity.

### What the Retention Curve Says
The standard retention curve for our stable cohorts (2025-Q1 and Q2) shows a gradual decay:
*   **M1 Retention:** ~95–95.7%
*   **M3 Retention:** ~87.5–86.4%
*   **M6 Retention:** ~80.0–78.6%

However, the **2025-Q3 cohort** breaks this pattern:
*   **M1:** 93.8% (Slightly lower, but within normal variance).
*   **M3:** **80.0%** (A 6–7 percentage point drop vs. prior cohorts).
*   **M6:** **65.0%** (A 13–15 percentage point drop vs. prior cohorts).

The 2025-Q4 and 2026-Q1 cohorts are too young to show M6 data, but their M3 figures (87.3% and 88.6% respectively) suggest the retention dip may have been specific to the Q3 cohort or is stabilizing. *Note: Q4/Q1 M3 data actually looks better than Q3, which complicates the narrative. See "Explanations" below.*

### The Anomalous Cohort: 2025-Q3
The **2025-Q3 cohort** is the primary outlier. It is the only cohort with an M6 retention rate below 70%.

**Why this difference matters (Statistical Context):**
With cohort sizes ranging from 120 to 175, we can use a rough rule of thumb for significance:
*   The standard error for a proportion with n=150 is roughly $\sqrt{p(1-p)/n} \approx 4\%$.
*   A difference of **>8 percentage points** between two cohorts of similar size is generally considered meaningful (approx. 2 standard errors).
*   The M6 gap between Q3 (65.0%) and Q2 (78.6%) is **13.6 points**. This is well beyond noise and indicates a real structural change.
*   The M3 gap between Q3 (80.0%) and Q2 (86.4%) is **6.4 points**. This is borderline but suspicious, especially given the subsequent M6 drop.

### Most Likely Explanations

**1. The New Guided Onboarding Flow (Launched July 1, 2025)**
*   **Supported by Data:** The Q3 cohort (signed up July–Sept) is the first fully exposed to the new flow. The sharp drop at M3 suggests users who completed onboarding may have struggled to find value or hit a "churn cliff" when the guided flow ended.
*   **Not Supported by Data:** The Q4 cohort (Oct–Dec) also used the new flow but shows *better* M3 retention (87.3%) than Q3. If the flow itself were broken, Q4 should also show a dip. This suggests the issue may not be the flow *alone*.

**2. The 12% Price Increase (Effective Oct 1, 2025)**
*   **Supported by Data:** The price increase affected new customers from Oct 1 onwards. The Q3 cohort (July–Sept) was *not* subject to the price increase for their initial contract. Therefore, the price increase **cannot explain the Q3 drop**.
*   **Critical Insight:** Since Q3 dropped *before* the price hike, the anomaly is likely driven by the **onboarding change** or a **seasonal/external factor** in Q3, not pricing.

**3. Seasonality or Market Conditions**
*   **Supported by Data:** Q3 is often a weaker period for enterprise sales. However, the drop is too severe (13.6 pts at M6) to be explained by seasonality alone, especially since Q1 and Q2 (also non-peak) performed well.

**Conclusion on Cause:** The data **cannot support** the price increase as the cause of the Q3 drop. The data **strongly suggests** the new onboarding flow introduced friction that manifested at M3 and led to higher churn by M6. The fact that Q4 M3 retention recovered suggests a possible fix or adaptation, but we need M6 data for Q4 to confirm.

### Three Concrete Next Steps

1.  **Audit the "Guided Flow" Drop-off Points**
    *   **Action:** Analyze user behavior logs for the Q3 cohort to identify where users abandoned the new guided flow or failed to reach "Aha!" moments. Compare with Q2 (old flow) behavior.
    *   **Metric to Show Success:** **% of new users completing the "Core Value" milestone within 7 days.** Target: Increase from current baseline (unknown, but likely <60% for Q3) to >75%.

2.  **Conduct Win-Back Interviews with Churned Q3 Customers**
    *   **Action:** Interview 10–15 customers from the Q3 cohort who churned between M3 and M6. Ask specifically about their onboarding experience and whether they felt the product delivered value after the guided flow ended.
    *   **Metric to Show Success:** **Qualitative Insight Score:** Identify at least 2 specific, actionable friction points mentioned by >50% of interviewees.

3.  **Monitor Q4 Cohort M6 Retention Closely**
    *   **Action:** Set up a weekly alert for the Q4 cohort’s M6 retention. If Q4 M6 retention is >75%, it confirms the Q3 issue was a one-off or has been fixed. If Q4 M6 retention is <70%, it confirms the new onboarding flow is fundamentally flawed.
    *   **Metric to Show Success:** **Q4 M6 Retention Rate ≥ 75%** (matching Q2 baseline).

---

### Appendix: Computed Retention Rates

| Cohort | Signed Up | M1 Retention | M3 Retention | M6 Retention | M9 Retention | M12 Retention |
|---|---|---|---|---|---|---|
| 2025-Q1 | 120 | 95.0% | 87.5% | 80.0% | 75.0% | 71.7% |
| 2025-Q2 | 140 | 95.0% | 86.4% | 78.6% | 73.6% | 70.0% |
| **2025-Q3** | **160** | **93.8%** | **80.0%** | **65.0%** | **59.4%** | **—** |
| 2025-Q4 | 150 | 95.3% | 87.3% | 79.3% | — | — |
| 2026-Q1 | 175 | 96.0% | 88.6% | — | — | — |

*Note: Retention % = (Active Customers at Month N / Original Cohort Size) * 100.*
