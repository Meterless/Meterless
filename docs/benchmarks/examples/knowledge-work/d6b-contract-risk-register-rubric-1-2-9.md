# Contract risk register, against a rubric

Knowledge work benchmark · Nightshift 1.2.9 · Sep 27, 2026 · Legal · job `job_mujswogd0k`

**[Replay this night in 3D ↗](https://meterless.ai/Benchmarks/KnowledgeWork/nights/D6b-contract-risk-register-rubric_1.2.9/index.html)** · [Read it on the Morning Desk ↗](https://meterless.ai/Benchmarks/KnowledgeWork/) · [All examples](README.md)

> The same contract review, held to a general counsel's must-have rubric.

| Judge score | Winning model | Drafts raced | Drafts judged | Unattended | Words |
|---|---|---:|---:|---:|---:|
| rubric: every must-have met | Qwen3.8 27B | 5 | 0 | 36 min | 1,291 |

**Verified against the answer key**

- Every must and should in the rubric met
- $480,858 / $105,000 / $1,750, all correct
- §14.2 auto-renewal and §11.1 data terms flagged

**Proofs passed:** complete, not cut off.

### The race

| Attempt | Lane | Model | Started | Finished | Tokens | Passed proofs | Judge | Kept |
|---:|---|---|---:|---:|---:|---|---:|---|
| 1 | generalist | Qwen2.5 14B | 0 min | 3.6 min | 957 | no |  |  |
| 2 | router | MiniCPM5 1B | 0 min | 5.4 min | 749 | yes |  |  |
| 3 | router | MiniCPM5 1B | 5.4 min | 7 min | 1,452 | yes |  |  |
| 4 | generalist | Qwen2.5 14B | 3.6 min | 7.9 min | 1,141 | yes |  |  |
| 6 | vision | Qwen3.8 27B | 0 min | 35 min | 2,010 | yes |  | **winner** |

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
**From:** Procurement & Risk Management
**Date:** October 26, 2023
**Subject:** Business Risk Review: 3-Year SaaS Agreement ($1.26M TCV) – Draft for Legal Review

### Executive Summary
This document outlines the commercial risks in the current draft. The total contract value (TCV) over 3 years is approximately **$1.26M** (assuming the 7% floor applies). The draft currently favors the Provider significantly regarding data rights, liability caps, and exit flexibility. Below is the risk register for your 15-minute review.

#### Key Financial Quantifications
*   **Year 1 Fee:** $420,000
*   **Year 2 Fee (7% floor):** $449,400
*   **Year 3 Fee (7% floor):** $480,858
*   **Total 3-Year Value:** ~$1,350,258
*   **Liability Cap (§9.2):** 3 months of Year 1 fees = $105,000.
*   **Service Credit (§7.1):** 5% of one month’s fee = ~$1,750 (Year 1).

---

### Risk Register

| Clause | Plain-English Meaning | Risk to the Customer | Severity & Reason | Specific Negotiation Ask | Fallback Position |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **§3.2** | Provider can change the software anytime as long as it doesn’t "materially" reduce features. | Ambiguity in "materially" allows Provider to degrade UX or remove minor but useful features without breaching contract. | **Medium**<br>Loss of functionality over time without recourse. | Replace "materially reduce functionality" with: "shall not materially adversely affect the Customer’s use of the Services or the value of the Services as described in the SOW." | Require written notice 30 days in advance of any changes that affect workflow. |
| **§4.1** | Price increases by 7% or CPI, whichever is higher. | Inflationary pressure exceeds market norms for SaaS (typically 3-5%). Locks in high costs. | **High**<br>Significant TCV increase; reduces ROI. | Cap annual increases at **3%** or "CPI, not to exceed 3%". | Accept 5% cap if Provider offers a multi-year price lock for Year 2 and 3. |
| **§4.4** | Pay within 15 days; late fees are 18% per annum (1.5%/mo). | Strict payment terms; high penalty rate for late payment. | **Medium**<br>Cash flow strain; high penalty if AP process delays. | Extend to **Net 30**. Reduce late interest to **1.0% per month** (12% AP). | Accept Net 15 if interest is reduced to 0.5% per month. |
| **§6.3** | Provider owns the right to use your data (even if anonymized) forever to improve their product. | Data leakage risk; potential competitive disadvantage; compliance issues (GDPR/CCPA) if "de-identified" standard is weak. | **High**<br>Loss of data exclusivity; regulatory exposure. | **Delete this clause entirely.** If retained, limit to "aggregated and de-identified in compliance with [GDPR/CCPA]" and require Provider to certify de-identification methodology. | Limit use to "improving the Services for all customers" (not "Provider’s products" generally) and add a right to audit the de-identification process. |
| **§7.1** | 99.5% uptime; only remedy is 5% credit if they miss it. | 99.5% allows ~3.6 hours of downtime/month. 5% credit is negligible compensation for business disruption. | **High**<br>Inadequate SLA; no real incentive for Provider to maintain high availability. | Increase uptime to **99.9%**. Increase service credit to **10-20%** of monthly fees for each 0.1% drop below SLA. Add termination right if SLA missed 3 months in a row. | Accept 99.5% if credit is increased to 10% and includes a "make-whole" provision for critical outages >4 hours. |
| **§9.2** | Total liability capped at 3 months of fees ($105k). | Cap is too low for a $1.26M contract. Does not cover data breaches, IP infringement, or gross negligence. | **High**<br>Exposure to losses far exceeding recovery amount. | Increase cap to **100% of annual fees** ($420k). **Carve out** data breaches, confidentiality breaches, IP infringement, and gross negligence from the cap. | Cap at **12 months of fees** ($420k) with carve-outs for data breaches and IP. |
| **§9.3** | Customer’s payment obligations are not subject to the liability cap. | Standard, but combined with §9.2, creates an imbalance where Provider’s max risk is $105k while Customer’s is unlimited. | **Low**<br>Standard clause, but contextually unfair due to §9.2. | Ensure §9.2 cap is raised (see above) to balance this. | No change needed if §9.2 is fixed. |
| **§11.1** | Auto-renews for 3 years unless you cancel 180 days before end. | Long lock-in. 180-day notice is a long lead time; easy to miss and get locked in for another 3 years. | **Medium**<br>Reduced flexibility; risk of unintended long-term commitment. | Shorten notice period to **90 days**. Change renewal term to **1 year** (not 3 years). | Accept 3-year renewal if notice period is reduced to 120 days. |
| **§12.4** | Only 10 days to export data after termination. | Too short to migrate data, especially with large datasets. Risk of data loss. | **Medium**<br>Operational risk during transition; potential data loss. | Extend export window to **30 days** (or 60 days for large data sets). Require Provider to assist with export format. | Accept 15 days if Provider provides a standard CSV/JSON export tool and support. |
| **§14.2** | Provider can sell the company and assign the contract to the buyer without asking you. | New owner may have different security practices, pricing, or culture. No right to terminate if you don’t want the new owner. | **Medium**<br>Loss of control over service provider identity. | Add: "Customer may terminate this Agreement within 30 days of notice of assignment if the assignee is a direct competitor of Customer." | Add right to terminate if assignee has a material breach of security standards. |

---

### Top 3 Issues to Raise First

1.  **Liability Cap (§9.2) & Data Rights (§6.3):** These are the most critical. The current $105k cap is negligible for a $1.26M contract, especially if a data breach occurs. Additionally, granting a perpetual license to use your data (even de-identified) is a significant competitive and compliance risk. **Fix these first to protect the core value of the deal.**
2.  **SLA & Remedies (§7.1):** A 99.5% SLA with a 5% credit is weak. If the service is down for 4 hours a month (which is allowed), your business suffers, but you only get $1,750 back. This misaligns incentives. **Negotiate a stronger SLA and higher credits to ensure service reliability.**
3.  **Price Escalation (§4.1):** A 7% floor is high. Over 3 years, this adds ~$150k to the TCV compared to a 3% cap. **Negotiate this down to 3-5% to improve the ROI and budget predictability.**

### Missing Clauses (Standard for SaaS of this Size)

1.  **Data Security & Compliance:** The draft lacks specific security requirements (e.g., SOC 2 Type II, ISO 27001), encryption standards (at rest and in transit), and breach notification timelines (e.g., Provider must notify Customer within 24-48 hours of a security incident).
2.  **Intellectual Property (IP) Ownership:** There is no clause explicitly stating that Customer owns its Data and that Provider owns its Software. Also, no IP infringement indemnification from Provider (if their software infringes on a third party’s patent/copyright, Provider should defend and indemnify Customer).
3.  **Audit Rights:** No right for Customer to audit Provider’s security practices, data handling, or compliance with the agreement. For a $1.26M contract, this is a standard expectation, especially given the data usage rights in §6.3.
4.  **Termination for Convenience:** No right for Customer to terminate the contract early for any reason (or with a penalty). This is important if your business needs change or if the service underperforms chronically but doesn’t breach the SLA.
5.  **Force Majeure:** Standard clause missing. Should define what constitutes force majeure and exclude payment obligations.

**Recommendation:** Prioritize negotiation on §9.2, §6.3, and §7.1. These have the highest impact on risk and value. The other items are important but can be addressed in subsequent rounds if needed.
