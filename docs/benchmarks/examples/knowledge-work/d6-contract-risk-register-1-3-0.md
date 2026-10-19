# Contract risk register

Knowledge work benchmark · Nightshift 1.3.0 · Sep 28, 2026 · Legal · job `job_mul0kq1c02`

**[Replay this night in 3D ↗](https://meterless.ai/Benchmarks/KnowledgeWork/nights/D6-contract-risk-register_1.3.0/index.html)** · [Read it on the Morning Desk ↗](https://meterless.ai/Benchmarks/KnowledgeWork/) · [All examples](README.md)

> A vendor contract turned into a clause-by-clause risk register with asks and fallbacks.

| Judge score | Winning model | Drafts raced | Drafts judged | Unattended | Words |
|---|---|---:|---:|---:|---:|
| 0.92 | Qwen3.8 27B | 6 | 4 | 26 min | 1,195 |

**Verified against the answer key**

- Year-3 fee $480,858 (7% escalator compounded)
- Liability cap $105,000; service credit $1,750
- Every clause with a severity, an ask and a fallback

**Proofs passed:** complete, not cut off; every calculation re-computed.

### The race

| Attempt | Lane | Model | Started | Finished | Tokens | Passed proofs | Judge | Kept |
|---:|---|---|---:|---:|---:|---|---:|---|
| 1 | generalist | Qwen2.5 14B | 0 min | 3.7 min | 935 | no |  |  |
| 2 | router | MiniCPM5 1B | 0 min | 5.7 min | 817 | yes | 0.08 |  |
| 3 | router | MiniCPM5 1B | 5.7 min | 6.6 min | 789 | yes | 0.12 |  |
| 4 | generalist | Qwen2.5 14B | 3.7 min | 7.5 min | 1,120 | yes | 0.48 |  |
| 5 | verifier | VibeThinker 3B | 0 min | 10.9 min | 305 | no |  |  |
| 6 | vision | Qwen3.8 27B | 0 min | 25.5 min | 1,924 | yes | 0.92 | **winner** |

<details><summary>The brief it answered, verbatim</summary>

```text
Our company (the Customer) is about to sign a 3-year SaaS agreement with a data-analytics vendor (the Provider) worth $420,000 per year. Legal is swamped; procurement needs a risk register that the general counsel can review in 15 minutes. You are not giving legal advice; you are preparing the business review.

CLAUSES FROM THE DRAFT (verbatim excerpts)

1. §3.2 "Provider may modify the Services from time to time, provided such modifications do not materially reduce functionality."
2. §4.1 "Fees increase annually by the greater of 7% or CPI."
3. §4.4 "Invoices are due net 15. Late amounts accrue interest at 1.5% per month."
4. §6.3 "Customer grants Provider a perpetual, irrevocable license to use Customer Data in aggregated and de-identified form to improve Provider's products."
5. §7.1 "Provider will use commercially reasonable efforts to make the Services available 99.5% of each calendar month. Customer's sole remedy for failure is a service credit of 5% of that month's fees."
6. §9.2 "Each party's total liability shall not exceed the fees paid in the three (3) months preceding the claim."
7. §9.3 "The limitation in §9.2 does not apply to Customer's payment obligations."
8. §11.1 "This Agreement renews automatically for successive 3-year terms unless either party gives notice of non-renewal at least 180 days before the end of the then-current term."
9. §12.4 "Upon termination, Provider will make Customer Data available for export for 10 days, after which it may be deleted."
10. §14.2 "Provider may assign this Agreement without consent in connection with a merger or sale of assets."

DELIVERABLE
- A risk register table with one row per clause: clause, plain-English meaning, risk to the Customer, severity (High / Medium / Low) with a one-line reason, the specific negotiation ask (proposed replacement wording or number), and a fallback position.
- Quantify where the text allows it: e.g. what the price-increase clause does to the year-3 fee at the 7% floor, what the §9.2 cap is in dollars at the year-1 fee, what the 5% credit is worth against one month's fee.
- Below the table: the top 3 issues to raise first and why, and anything missing from the draft that a SaaS agreement of this size normally has (at least 3 items).
```

</details>

---

## The winning deliverable, verbatim

<!-- Copied unmodified from the published job. Model output keeps its own punctuation and any dates it invented. -->

**To:** General Counsel
**From:** Procurement
**Date:** October 26, 2023
**Subject:** Risk Register & Business Review: Data-Analytics Vendor SaaS Agreement ($420k/yr)

**Context:** This is a business risk assessment for a 3-year contract totaling **$1.26M** (Year 1) + escalations. Legal is not providing advice; this highlights commercial exposure requiring negotiation before signature.

### Risk Register

| Clause | Plain-English Meaning | Risk to Customer | Severity & Reason | Specific Negotiation Ask | Fallback Position |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **§3.2** | Provider can change the product anytime, as long as it doesn't "materially reduce" features. | **Scope Creep/Obsolescence:** "Materially" is subjective. Provider could degrade performance or remove niche features critical to our workflow, claiming no "material" reduction. | **Medium**<br>Subjective standard makes it hard to enforce if the tool becomes less useful. | **Replace "materially reduce functionality"** with: *"do not materially diminish the features, performance, or usability of the Services as of the Effective Date, as determined by Customer in its reasonable discretion."* | Require 30 days' prior notice of changes + right to terminate without penalty if changes materially impact business operations. |
| **§4.1** | Price rises by 7% or CPI (whichever is higher) every year. | **Budget Blowout:** At 7%, Year 2 = $449,400; Year 3 = $480,858. Total 3-yr cost jumps to **$1.35M** (+$90k vs. base). | **High**<br>7% is above market standard (typically 3–5%). Unpredictable if CPI spikes. | **Cap annual increase at 3%** or **CPI, whichever is lower**. | Accept 5% cap if CPI is used, but require CPI index to be specified (e.g., US CPI-U). |
| **§4.4** | Pay within 15 days. Late fee is 1.5%/mo (18% APR). | **Cash Flow/Operational Risk:** Net 15 is aggressive for a $35k/month invoice. 1.5% monthly interest is punitive (18% annualized). | **Medium**<br>High penalty for administrative delays; tight payment window strains AP processes. | **Change to Net 30.** **Cap late interest at 1% per month** (12% APR) or prime rate + 2%. | Net 30 with 1.5% interest if we must keep the high rate, but require 10-day written notice before interest accrues. |
| **§6.3** | Provider gets a permanent license to use our data (even anonymized) to improve their products. | **Data Privacy/Competitive Risk:** "De-identified" is not legally defined. If re-identification is possible, we leak competitive insights to Provider’s other clients. | **High**<br>Perpetual license creates long-tail liability and potential IP leakage. | **Delete "perpetual."** Limit to term of agreement. **Add:** *"De-identification must comply with GDPR/CCPA standards, and Provider shall not attempt to re-identify data."* | If perpetual is non-negotiable, require strict contractual prohibition on re-identification + audit rights to verify de-identification methods. |
| **§7.1** | 99.5% uptime (allows ~3.6 hrs downtime/mo). Sole remedy: 5% credit. | **Business Continuity:** 3.6 hrs/month is high for analytics. 5% credit (~$1,750) is negligible vs. cost of downtime ($10k+ in lost productivity). | **High**<br>Remedy is not proportional to impact. 99.5% is low for enterprise SaaS (standard is 99.9%). | **Increase SLA to 99.9%.** **Increase credit to 10% for <99.9%, 20% for <99.5%.** Add right to terminate if SLA missed 3 consecutive months. | Keep 99.5% but increase credit to 15% and add termination right for chronic failure. |
| **§9.2** | Liability capped at last 3 months’ fees. | **Inadequate Protection:** Cap = 3 × $35,000 = **$105,000**. If Provider breaches data security or IP, our damages could exceed $1M. | **High**<br>Cap is too low for a $1.2M+ contract. Exposes us to unrecoverable losses. | **Cap at 12 months’ fees** ($420k). **Carve out:** Data breaches, IP infringement, and gross negligence from the cap. | Cap at 12 months’ fees. If Provider resists, accept 6 months’ fees but **must** carve out data breaches and IP infringement. |
| **§9.3** | Customer’s payment obligations are not capped. | **Standard but risky:** We pay in full even if Service fails. | **Low**<br>Standard clause, but combined with weak SLA (§7.1), we pay for poor service. | **Add:** *"Customer’s payment obligations are subject to offset against any service credits or damages owed by Provider."* | Accept as-is, but ensure §7.1 credits are automatically applied to invoices. |
| **§11.1** | Auto-renews for 3 years unless we cancel 180 days before end. | **Lock-in Trap:** 180-day notice is long. If we miss the window, we’re locked in for another 3 years at escalated prices. | **Medium**<br>High barrier to exit if service degrades or business needs change. | **Reduce notice period to 60 days.** Or **make renewal optional** (no auto-renewal). | 90-day notice period. |
| **§12.4** | Data export window is only 10 days after termination. | **Data Loss Risk:** 10 days is too short to migrate large analytics datasets. Risk of data loss if migration fails. | **Medium**<br>Operational risk during transition. | **Extend export window to 30 days.** Add: *"Provider shall assist with migration at no additional cost."* | 20-day window with Provider assistance. |
| **§14.2** | Provider can assign contract to acquirer without our consent. | **Change of Control Risk:** We may end up with a less reputable or financially unstable owner. | **Low**<br>Common in M&A, but we lose control over who holds our data. | **Require prior written consent** for assignment to a competitor or if acquirer is not financially sound. | Accept assignment, but require Provider to guarantee acquirer assumes all obligations. |

---

### Top 3 Issues to Raise First

1.  **Liability Cap (§9.2) & Data License (§6.3):**  
    *Why:* These are existential risks. A $105k cap is inadequate for a $1.2M contract, especially if a data breach occurs. The perpetual data license creates long-term competitive and privacy exposure. These clauses need fundamental restructuring, not just tweaks.
2.  **SLA & Remedy (§7.1):**  
    *Why:* The 99.5% uptime with a 5% credit is a poor trade-off. If the analytics platform is down, our business operations halt. The remedy must reflect the actual business impact, not just a token discount. This is a core service expectation.
3.  **Price Escalation (§4.1):**  
    *Why:* 7% annual increase is significantly above market. Over 3 years, this adds ~$90k to the contract value. Negotiating this down to 3–5% has the highest direct financial impact on the total cost of ownership.

---

### Missing Clauses (Critical for SaaS of This Size)

1.  **Data Security & Breach Notification:**  
    The draft has no explicit security standards (e.g., SOC 2 Type II, ISO 27001) or breach notification timeline (e.g., "within 48 hours"). For a data-analytics vendor, this is non-negotiable.
2.  **Subprocessor Controls:**  
    No clause limits Provider’s use of subprocessors or requires Customer approval for new subprocessors. If Provider uses a third party to store our data, we need visibility and contractual flow-down of obligations.
3.  **Audit Rights:**  
    No right for Customer to audit Provider’s compliance with security, data usage, or SLAs. Given the data license in §6.3, we need the right to verify how our data is being handled.
4.  **Force Majeure:**  
    Not listed, but standard. Should exclude payment obligations and ensure SLA credits are not voided by Provider’s own operational failures disguised as force majeure.
5.  **Governing Law & Dispute Resolution:**  
    Not listed. Need to specify jurisdiction (preferably Customer’s state) and whether disputes go to arbitration or court.
