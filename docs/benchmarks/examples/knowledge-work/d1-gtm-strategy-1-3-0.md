# Go-to-market plan to $5M ARR

Knowledge work benchmark · Nightshift 1.3.0 · Sep 28, 2026 · Strategy · job `job_mul0krpw0b`

**[Replay this night in 3D ↗](https://meterless.ai/Benchmarks/KnowledgeWork/nights/D1-gtm-strategy_1.3.0/index.html)** · [Read it on the Morning Desk ↗](https://meterless.ai/Benchmarks/KnowledgeWork/) · [All examples](README.md)

> A 12-month GTM memo that works back from the ARR target to logos, pipeline and channels.

| Judge score | Winning model | Drafts raced | Drafts judged | Unattended | Words |
|---|---|---:|---:|---:|---:|
| 0.90 | Qwen3.8 27B | 5 | 2 | 28 min | 1,270 |

**Verified against the answer key**

- NRR maths right: $3.1M × 108% = $3.348M retained
- $1.652M new ARR needed → 76 new logos → 245 opportunities at a 31% win rate
- AE capacity tested against the plan
- 1,270 words, inside the 900–1,300 brief

**Proofs passed:** complete, not cut off; meets the length asked; every calculation re-computed.

### The race

| Attempt | Lane | Model | Started | Finished | Tokens | Passed proofs | Judge | Kept |
|---:|---|---|---:|---:|---:|---|---:|---|
| 1 | generalist | Qwen2.5 14B | 0 min | 4.5 min | 1,254 | no |  |  |
| 2 | generalist | Qwen2.5 14B | 4.5 min | 8.7 min | 1,324 | yes | 0.62 |  |
| 3 | router | MiniCPM5 1B | 0 min | 9.7 min | 3,378 | no |  |  |
| 5 | generalist | Qwen2.5 14B | 8.7 min | 12.8 min | 1,290 | no |  |  |
| 6 | vision | Qwen3.8 27B | 0 min | 27 min | 2,057 | yes | 0.90 | **winner** |

<details><summary>The brief it answered, verbatim</summary>

```text
Write a go-to-market strategy memo for the leadership team of Ledgerly. It will be read before Monday's planning meeting, so it must be decision-ready, not a textbook.

COMPANY FACTS (use these; do not invent other metrics)
- Product: accounts-payable automation (invoice capture, 3-way PO matching, approval routing, payment runs) for mid-market companies with 200–2,000 employees.
- Today: $3.1M ARR, 142 customers, average contract value $21.8k/yr, gross revenue retention 91%, net revenue retention 108%.
- Sales motion: founder-led plus 3 AEs; 70% of new logos came from accountant referrals; a median sales cycle of 64 days.
- Best-fit segment so far: US manufacturing and wholesale distribution companies running NetSuite or Microsoft Dynamics 365 Business Central. Win rate is 31% there vs 12% elsewhere.
- Weak spots: no SAP integration; onboarding takes 6 weeks on average; the brand is unknown outside referral circles.
- Budget for next 2 quarters: $900k incremental GTM spend. Board goal: $5.0M ARR in 12 months.

THE MEMO MUST CONTAIN
1. A one-paragraph recommendation up front (the "bottom line").
2. The ideal customer profile with explicit in/out criteria.
3. The channel plan: at most 3 bets, each with the reason, the owner role, the spend out of the $900k, and the leading indicator to watch in the first 30 days.
4. A 90-day plan as a table (weeks 1–4, 5–8, 9–13).
5. The arithmetic showing whether $5.0M ARR in 12 months is reachable: new ARR needed, how many new logos that implies at the current ACV once retention/expansion is accounted for, and the pipeline needed at the stated win rates. Say plainly if it is a stretch.
6. The top 3 risks and what would make you change course.

Length: 900–1,300 words. Plain business English, no hype words.
```

</details>

---

## The winning deliverable, verbatim

<!-- Copied unmodified from the published job. Model output keeps its own punctuation and any dates it invented. -->

**MEMORANDUM**

**TO:** Ledgerly Leadership Team
**FROM:** Head of Growth
**DATE:** October 24, 2024
**SUBJECT:** Go-to-Market Strategy for Q4–Q1: Path to $5.0M ARR

### 1. Bottom Line Recommendation

We cannot reach the $5.0M ARR goal by broadening our target market or relying on our current sales motion. Our win rate is 31% in our best-fit segment (US Manufacturing/Distribution on NetSuite/D365 BC) but only 12% elsewhere. Therefore, the strategy for the next two quarters is to aggressively concentrate the $900k budget on scaling the "Accountant Referral" channel and building a direct outbound engine specifically for the NetSuite/D365 BC ecosystem. We will ignore all other verticals and tech stacks. We must accept that the $5.0M target is a stretch goal that requires a 10% increase in close rate or a 15% increase in ACV to be realistic, but focusing exclusively on our highest-probability segment gives us the best statistical chance of hitting it.

### 2. Ideal Customer Profile (ICP)

To maintain efficiency, we must strictly define who we pursue. Sales resources should not be spent on accounts that do not meet these criteria.

**In-Criteria (Must have all):**
*   **Industry:** US-based Manufacturing or Wholesale Distribution.
*   **Size:** 200–2,000 employees.
*   **Tech Stack:** Currently running NetSuite or Microsoft Dynamics 365 Business Central.
*   **Pain Point:** High volume of manual invoice entry (estimated >500 invoices/month) and lack of automated 3-way matching.
*   **Budget Authority:** CFO or VP of Finance reachable within 2 weeks.

**Out-Criteria (Do not pursue):**
*   **Tech Stack:** SAP, Oracle, or legacy on-premise ERP systems. (We have no integration; do not attempt custom workarounds).
*   **Industry:** Technology, Healthcare, or Retail (unless they fit the size/ERP criteria, but these are low priority due to lower win rates).
*   **Size:** <200 employees (too small for ACV) or >2,000 employees (too complex for current onboarding capacity).
*   **Process:** Companies with no formal AP process or those using only spreadsheets (low intent for automation).

### 3. Channel Plan: Three Bets

We will allocate the $900k incremental budget across three specific channels. We are not building a marketing department; we are building a lead generation engine.

**Bet 1: Formalize and Scale the Accountant Referral Program**
*   **Reason:** 70% of our current logos come from this source. It is our highest-trust, lowest-cost channel. We need to systematize it to remove the dependence on founder relationships.
*   **Owner Role:** Customer Success Manager (CSM) leads the program; Sales Ops tracks attribution.
*   **Spend:** $300k. This covers a tiered incentive structure (recurring revenue share for accountants who refer clients), co-branded webinars, and a dedicated "Partner Portal" for accountants to track referrals.
*   **Leading Indicator (30 Days):** Number of active accountant partners logging into the portal and number of qualified referrals submitted per week.

**Bet 2: Targeted Outbound to NetSuite/D365 BC Users**
*   **Reason:** We have a 31% win rate in this specific niche. We need volume. We will use intent data (e.g., firms recently upgrading their ERP or hiring AP managers) to trigger outbound sequences.
*   **Owner Role:** Head of Sales (managing the 3 AEs and hiring 2 SDRs).
*   **Spend:** $400k. This covers the salaries of 2 new SDRs, data enrichment tools (ZoomInfo/Clari), and cold email infrastructure.
*   **Leading Indicator (30 Days):** Number of meetings booked per SDR per week. Target: 5 meetings/week/SDR.

**Bet 3: Ecosystem Integration Marketing**
*   **Reason:** We are invisible outside referral circles. We need to appear where the decision-makers are looking for solutions. We will list on NetSuite and Microsoft Dynamics partner directories and run targeted LinkedIn ads to job titles (AP Manager, Controller) in our target industries.
*   **Owner Role:** Marketing Manager (new hire or contractor).
*   **Spend:** $200k. This covers listing fees, content production (case studies specifically for Manufacturing/Distribution), and LinkedIn ad spend.
*   **Leading Indicator (30 Days):** Cost Per Lead (CPL) from inbound traffic and number of demo requests from organic/partner channel.

### 4. 90-Day Execution Plan

| Phase | Timeline | Key Activities | Success Metric |
| :--- | :--- | :--- | :--- |
| **Foundation** | Weeks 1–4 | 1. Hire 2 SDRs and 1 Marketing Manager.<br>2. Launch Accountant Referral Portal.<br>3. Build ICP list of 5,000 NetSuite/D365 BC accounts.<br>4. Create 3 case studies focused on Manufacturing/Distribution. | 5,000 accounts in CRM; Portal live with 10 pilot accountants. |
| **Traction** | Weeks 5–8 | 1. Launch outbound sequences (SDRs).<br>2. Begin LinkedIn ad campaigns targeting ICP.<br>3. Host first 2 co-branded webinars with top accountant partners.<br>4. Refine messaging based on first 20 sales calls. | 100+ meetings booked; 20+ qualified leads from referrals. |
| **Scale** | Weeks 9–13 | 1. Double down on winning messaging.<br>2. Increase ad spend if CPL is <$50.<br>3. Expand referral program to top 20% of accountants.<br>4. Review pipeline coverage; adjust SDR targets if needed. | $1.5M in qualified pipeline; 15+ new logos closed. |

### 5. The Arithmetic: Is $5.0M ARR Reachable?

Let’s look at the math plainly.

*   **Current ARR:** $3.1M
*   **Target ARR (12 months):** $5.0M
*   **Gross Revenue Retention (GRR):** 91%
*   **Net Revenue Retention (NRR):** 108%

**Step 1: Calculate Existing ARR Contribution**
Existing customers will contribute:
$3.1M (Current ARR) × 108% (NRR) = **$3.348M**

**Step 2: Calculate New ARR Needed**
$5.0M (Target) - $3.348M (Existing) = **$1.652M** in New ARR required.

**Step 3: Calculate New Logos Required**
Average Contract Value (ACV): $21.8k
$1.652M / $21.8k = **75.8 New Logos** required in 12 months.

**Step 4: Calculate Pipeline Required**
Current Win Rate (Best Fit): 31%
Pipeline Needed = New Logos / Win Rate
75.8 / 0.31 = **244.5 Opportunities** required.

**Is this realistic?**
We currently have 3 AEs. To close 76 new logos in 12 months, each AE must close ~25 logos.
*   Current Sales Cycle: 64 days.
*   Max Closes per AE per Year (Theoretical): 12 months / 64 days ≈ 5.6 cycles.
*   Realistic Closes per AE: Given ramp-up, admin time, and negotiation, 25 logos per AE is **extremely aggressive**. A standard high-performing AE might close 10–15 logos/year in a mid-market SaaS context.

**Conclusion:**
The $5.0M goal is a **stretch**. To hit it, we must either:
1.  Increase ACV by 15% (to ~$25k) through upsells (reducing logos needed to ~66).
2.  Improve Win Rate to 40% (reducing pipeline needed to ~190).
3.  Hire 2 additional AEs in Q1 to increase capacity.

If we do not increase headcount or improve efficiency, we will likely land at **$4.2M–$4.5M ARR**. We recommend proceeding with the $900k budget but setting internal expectations that $5.0M requires operational excellence beyond standard execution.

### 6. Top 3 Risks and Change Triggers

1.  **Onboarding Bottleneck:** Our 6-week onboarding time is a major friction point. If we scale leads but cannot onboard them, we will churn early.
    *   *Change Trigger:* If onboarding time exceeds 7 weeks for 3 consecutive months, we pause outbound hiring and invest in product automation or hire 2 onboarding specialists.

2.  **Referral Channel Saturation:** We rely heavily on accountants. If this channel slows, our pipeline collapses.
    *   *Change Trigger:* If referral-sourced leads drop below 30% of total pipeline by Day 60, we reallocate $100k from Referral Program to Direct Outbound (Bet 2) and increase SDR headcount.

3.  **Win Rate Decline in ICP:** If our 31% win rate drops below 25%, the math breaks.
    *   *Change Trigger:* If win rate drops below 25% after 50 opportunities in the ICP, we pause new logo acquisition and spend 2 weeks with top 10 lost deals to understand the specific objections (likely price or feature gap vs. SAP). We may need to adjust pricing or messaging.

**Next Steps:**
Please review the budget allocation. If approved, I will begin hiring for the SDR and Marketing roles immediately to meet the Week 1–4 timeline.
