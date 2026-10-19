# Contract risk register, against a rubric

Knowledge work benchmark · Nightshift 1.2.7 · Sep 26, 2026 · Legal · job `job_muio1psk0k`

**[Replay this night in 3D ↗](https://meterless.ai/Benchmarks/KnowledgeWork/nights/D6b-contract-risk-register-rubric_1.2.7/index.html)** · [Read it on the Morning Desk ↗](https://meterless.ai/Benchmarks/KnowledgeWork/) · [All examples](README.md)

> The same contract review, held to a general counsel's must-have rubric.

| Judge score | Winning model | Drafts raced | Drafts judged | Unattended | Words |
|---|---|---:|---:|---:|---:|
| rubric: every must-have met | Qwen3.8 27B | 4 | 0 | 35 min | 1,029 |

**Verified against the answer key**

- Every must-have in the counsel's rubric met
- $480,858 / $105,000 / $1,750, all correct
- 10 clause rows, perpetual licence and notice periods flagged

**Proofs passed:** complete, not cut off.

### The race

| Attempt | Lane | Model | Started | Finished | Tokens | Passed proofs | Judge | Kept |
|---:|---|---|---:|---:|---:|---|---:|---|
| 2 | router | MiniCPM5 1B | 0 min | 4.9 min | 1,167 | yes |  |  |
| 3 | generalist | Qwen2.5 14B | 0 min | 5.4 min | 1,389 | yes |  |  |
| 4 | router | MiniCPM5 1B | 4.9 min | 7.9 min | 760 | no |  |  |
| 6 | vision | Qwen3.8 27B | 0 min | 34.2 min | 1,651 | yes |  | **winner** |

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

### Risk Register Table

| Clause | Plain-English Meaning | Risk to the Customer | Severity | Specific Negotiation Ask | Fallback Position |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **§3.2** | Provider can change the service without our consent, as long as they don't "materially" reduce functionality. | "Materially" is undefined; Provider could degrade performance or remove key features without approval. | **Medium**<br>*Undefined standard allows unilateral degradation.* | "Provider may modify the Services provided such modifications do not reduce functionality, usability, or performance in any material way." | "Provider may modify the Services from time to time, provided such modifications do not significantly reduce functionality or usability." |
| **§4.1** | Annual fee increases by the greater of 7% or CPI. | Fees escalate aggressively. Year 2: ~$449,400. Year 3: ~$480,858. Total 3-year cost exceeds $1.35M. | **High**<br>*Guaranteed 7% floor ignores economic reality.* | "Fees increase annually by the lesser of 7% or CPI." | "Fees increase annually by the lesser of 5% or CPI." |
| **§4.4** | Invoices due in 15 days; late payments accrue 1.5% monthly interest (18% annualized). | Short payment window strains cash flow; high penalty rate for administrative delays. | **Medium**<br>*15-day net terms are aggressive for $35k monthly invoices.* | "Invoices are due net 30 days. Late amounts accrue interest at 1% per month." | "Invoices are due net 30 days. Late amounts accrue interest at 1.25% per month." |
| **§6.3** | Customer grants a perpetual, irrevocable license to Provider for aggregated/de-identified data to improve their products. | Loss of data control; Provider can use our data indefinitely, even after we leave, to build competing products. | **High**<br>*Perpetual license outlives the business relationship.* | "Customer grants a license to use aggregated and de-identified Customer Data solely during the Term for product improvement." | "Customer grants a license to use aggregated and de-identified Customer Data for 2 years post-termination for product improvement." |
| **§7.1** | 99.5% uptime target; sole remedy is a 5% service credit for downtime. | Negligible compensation. 5% of one month’s fee ($35,000) is $1,750, which is trivial compared to operational downtime costs. | **High**<br>*Sole remedy is financially insignificant relative to impact.* | "Provider must achieve 99.9% uptime. Service credits: 10% for <99.9%, 25% for <99.5%, 50% for <99.0%." | "Provider must achieve 99.5% uptime. Service credits: 10% for <99.5%, 25% for <99.0%." |
| **§9.2** | Liability capped at 3 months of fees (~$105,000). | Cap is too low to cover data breaches, IP infringement, or major service failures. | **High**<br>*$105k cap is insufficient for enterprise-scale risk.* | "Provider’s total liability shall not exceed the fees paid over the 12 months preceding the claim (~$420,000)." | "Provider’s total liability shall not exceed $500,000." |
| **§9.3** | Payment obligations are not capped by §9.2. | Asymmetry: Our exposure is unlimited, while Provider’s is capped at $105k. | **Medium**<br>*Standard in SaaS, but exacerbates the low cap in §9.2.* | "The limitation in §9.2 applies to all obligations except Customer’s payment obligations." | (Accept as is, but ensure §9.2 cap is raised first.) |
| **§11.1** | Agreement auto-renews for 3-year terms unless 180-day notice given. | High lock-in risk. Missing the 180-day window commits us to another 3 years at increased fees. | **High**<br>*Long auto-renewal term with long notice period.* | "Agreement renews for 1-year terms unless either party gives notice of non-renewal at least 90 days before the end of the then-current term." | "Agreement renews for 1-year terms unless either party gives notice of non-renewal at least 120 days before the end of the then-current term." |
| **§12.4** | Data export available for 10 days post-termination. | Risk of data loss; 10 days is insufficient for large datasets or complex migrations. | **Medium**<br>*Insufficient transition window for data migration.* | "Provider will make Customer Data available for export for 30 days after termination." | "Provider will make Customer Data available for export for 14 days after termination." |
| **§14.2** | Provider can assign the agreement in a merger/sale without consent. | We lose control over who provides the service; new owner may have different security/privacy standards. | **Medium**<br>*No consent right for change of control.* | "Provider cannot assign this agreement without Customer's prior written consent, not to be unreasonably withheld, in connection with a merger or sale of assets." | "Provider may assign in connection with a merger or sale of assets, provided the assignee assumes all obligations and maintains equivalent security standards." |

### Top 3 Issues to Raise First

1.  **§9.2 Liability Cap ($105,000):** This is the most critical financial risk. A $105k cap is less than one quarter of the annual fee. If the Provider suffers a data breach, IP infringement, or prolonged outage, our recovery is capped at a negligible amount. We must raise this to at least 12 months of fees ($420,000) to ensure meaningful recourse.
2.  **§4.1 Fee Escalation (Greater of 7% or CPI):** This clause guarantees a 7% annual increase regardless of inflation. Over 3 years, this adds ~$61,000 in unexpected costs. Changing to "lesser of 7% or CPI" protects against high-inflation scenarios and aligns cost increases with economic reality.
3.  **§11.1 Auto-Renewal (3-Year Terms, 180-Day Notice):** The combination of a 3-year renewal term and a 180-day notice period creates a significant lock-in risk. If we miss the notice window, we are committed to another 3 years at escalated fees. Reducing this to 1-year terms with 90-day notice provides necessary flexibility.

### Missing Items in the Draft

1.  **Data Security and Compliance Standards:** The draft lacks specific references to security standards (e.g., SOC 2 Type II, ISO 27001) or compliance with regulations like GDPR/CCPA. For a data-analytics vendor, this is a critical omission.
2.  **Subprocessor Approval and Liability:** There is no clause governing the Provider’s use of subprocessors. We need the right to approve subprocessors and hold the Provider liable for their actions.
3.  **Exit and Transition Assistance:** Beyond the 10-day data export (§12.4), there is no provision for transition assistance, knowledge transfer, or cooperation during the offboarding process. This is essential for a smooth migration to a new vendor.
