# Company OKRs from strategy

Knowledge work benchmark · Nightshift 1.3.0 · Sep 28, 2026 · Leadership · job `job_mul0ks5g0e`

**[Replay this night in 3D ↗](https://meterless.ai/Benchmarks/KnowledgeWork/nights/D13-okrs-from-strategy_1.3.0/index.html)** · [Read it on the Morning Desk ↗](https://meterless.ai/Benchmarks/KnowledgeWork/) · [All examples](README.md)

> Quarterly OKRs from a strategy brief: measurable, owned, with baselines.

| Judge score | Winning model | Drafts raced | Drafts judged | Unattended | Words |
|---|---|---:|---:|---:|---:|
| 0.95 | Qwen3.8 27B | 5 | 5 | 27 min | 824 |

**Verified against the answer key**

- 3 objectives × 3 key results, each with an owning executive
- Every KR has a baseline or "measure in week 1"
- 10 facts from the strategy used; two explicit NOT-dos

**Proofs passed:** complete, not cut off; no invented quotes with figures.

### The race

| Attempt | Lane | Model | Started | Finished | Tokens | Passed proofs | Judge | Kept |
|---:|---|---|---:|---:|---:|---|---:|---|
| 1 | generalist | Qwen2.5 14B | 0 min | 2.3 min | 604 | yes | 0.22 |  |
| 2 | generalist | Qwen2.5 14B | 2.3 min | 4.5 min | 652 | yes | 0.85 |  |
| 3 | router | MiniCPM5 1B | 0 min | 5.4 min | 530 | yes | 0.18 |  |
| 4 | generalist | Qwen2.5 14B | 4.5 min | 6.5 min | 571 | yes | 0.62 |  |
| 6 | vision | Qwen3.8 27B | 0 min | 25 min | 1,407 | yes | 0.95 | **winner** |

<details><summary>The brief it answered, verbatim</summary>

```text
Draft Q1 2027 company OKRs (3 objectives, 3 key results each) for Tidewell, a 55-person B2B SaaS company selling water-leak detection for commercial buildings. Constraints: every key result is measurable with a baseline and a target from the facts below (or explicitly marked "baseline to be measured in week 1"), no key result is an activity ("launch X") unless paired with an outcome, and each objective names one owning executive. Then list two things the company should explicitly NOT do in Q1 and why.

FACTS (Q4 2026)
- ARR $6.2M; 410 buildings under contract; average 38 sensors per building.
- Gross margin 61% (hardware-heavy); target 65% by end of 2027.
- Sensor false-alarm rate 3.1 per building per month; top complaint in NPS verbatims; NPS 22.
- Sales cycle 94 days; 60% of pipeline comes from 3 property-management partners.
- Installation backlog 7 weeks; target under 3 weeks.
- Cash runway 20 months; no plan to raise before 2028.
Strategy statement from the board: "Win the mid-size property manager (20–200 buildings) by being the most trusted system in the building, then expand to insurance partnerships."
```

</details>

---

## The winning deliverable, verbatim

<!-- Copied unmodified from the published job. Model output keeps its own punctuation and any dates it invented. -->

### Q1 2027 OKRs for Tidewell

**Context:** Tidewell is a 55-person B2B SaaS company with $6.2M ARR, focusing on water-leak detection. The strategic priority is to win mid-size property managers (20–200 buildings) by establishing trust through reliability (reducing false alarms) and operational efficiency (reducing installation backlog), while improving gross margin.

---

#### **Objective 1: Establish Tidewell as the most reliable leak-detection system to drive NPS improvement**
*   **Owning Executive:** Chief Product Officer (CPO)
*   **Rationale:** The top complaint in NPS verbatims is the high false-alarm rate (3.1/building/month). Reducing this is critical to building trust with mid-size property managers, who are sensitive to operational disruption.

*   **Key Result 1.1:** Reduce average sensor false-alarm rate from **3.1 per building per month** (Q4 2026 baseline) to **≤1.5 per building per month** by end of Q1 2027.
    *   *Measurement:* Tracked via sensor telemetry logs; baseline confirmed from Q4 2026 data.
*   **Key Result 1.2:** Increase Net Promoter Score (NPS) from **22** (Q4 2026 baseline) to **≥35** by end of Q1 2027.
    *   *Measurement:* Quarterly NPS survey of all active building managers; baseline confirmed from Q4 2026 survey.
*   **Key Result 1.3:** Achieve **≥95%** resolution rate for false-alarm-related support tickets within **48 hours** (baseline to be measured in week 1).
    *   *Measurement:* Support ticket system data; baseline to be measured in week 1 of Q1 2027.

---

#### **Objective 2: Accelerate customer onboarding by reducing installation backlog to under 3 weeks**
*   **Owning Executive:** Chief Operating Officer (COO)
*   **Rationale:** A 7-week installation backlog is a major friction point for new customers and a risk to retention. Reducing this to under 3 weeks is essential for scaling with mid-size property managers who expect rapid deployment across multiple sites.

*   **Key Result 2.1:** Reduce average installation backlog from **7 weeks** (Q4 2026 baseline) to **≤3 weeks** by end of Q1 2027.
    *   *Measurement:* Average days from contract signature to sensor activation; baseline confirmed from Q4 2026 data.
*   **Key Result 2.2:** Increase number of buildings installed per week from **~5.8** (calculated: 410 buildings / 7 weeks ≈ 58.6/week, but backlog implies throughput; *Note: To make this measurable, we use throughput*) to **≥15 buildings per week** by end of Q1 2027.
    *   *Measurement:* Weekly count of buildings with sensors activated; baseline to be measured in week 1 (current weekly throughput).
*   **Key Result 2.3:** Reduce average cost per installation (labor + hardware) by **10%** from **$X** (baseline to be measured in week 1) to **$Y** (10% reduction) by end of Q1 2027.
    *   *Measurement:* Finance system data; baseline to be measured in week 1 of Q1 2027.

---

#### **Objective 3: Improve gross margin to 63% by optimizing hardware costs and sales efficiency**
*   **Owning Executive:** Chief Financial Officer (CFO)
*   **Rationale:** Gross margin is 61% (hardware-heavy). The target is 65% by end of 2027. Q1 should make meaningful progress toward this. Additionally, reducing dependency on 3 property-management partners (60% of pipeline) improves resilience and can improve sales efficiency.

*   **Key Result 3.1:** Increase gross margin from **61%** (Q4 2026 baseline) to **≥63%** by end of Q1 2027.
    *   *Measurement:* Monthly P&L; baseline confirmed from Q4 2026 financials.
*   **Key Result 3.2:** Reduce cost of goods sold (COGS) per sensor unit by **5%** from **$A** (baseline to be measured in week 1) to **$B** (5% reduction) by end of Q1 2027.
    *   *Measurement:* Supply chain/finance data; baseline to be measured in week 1 of Q1 2027.
*   **Key Result 3.3:** Reduce sales cycle length from **94 days** (Q4 2026 baseline) to **≤85 days** by end of Q1 2027.
    *   *Measurement:* CRM data (average days from opportunity creation to closed-won); baseline confirmed from Q4 2026 data.

---

### Two Things Tidewell Should Explicitly NOT Do in Q1 2027

1.  **Do NOT launch new hardware features or sensor models.**
    *   **Why:** The current false-alarm rate (3.1/building/month) is the top complaint and a trust killer. Introducing new hardware risks introducing new bugs, increasing support load, and potentially worsening the false-alarm rate. The priority is stabilizing and improving the *existing* sensor’s reliability (Objective 1) and reducing installation backlog (Objective 2). New hardware would divert engineering and support resources away from fixing core reliability issues and could further delay installations, exacerbating the backlog.

2.  **Do NOT aggressively pursue new insurance partnerships or large enterprise deals (>200 buildings).**
    *   **Why:** The board’s strategy is to "win the mid-size property manager (20–200 buildings)" first. Insurance partnerships and large enterprise deals typically have longer sales cycles, higher customization requirements, and greater implementation complexity. Pursuing them now would strain the already overloaded installation team (7-week backlog) and sales team, potentially jeopardizing the core strategy of building trust with mid-size property managers. Additionally, with 60% of pipeline already dependent on 3 partners, diversifying into complex insurance deals without first solidifying the mid-size segment and reducing dependency risks creating a fragile, high-maintenance revenue stream. Focus on executing well with the defined ICP (mid-size property managers) to build a strong foundation before expanding.
