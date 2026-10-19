# Pricing and positioning

Knowledge work benchmark · Nightshift 1.3.0 · Sep 28, 2026 · Strategy · job `job_mul0ks080d`

**[Replay this night in 3D ↗](https://meterless.ai/Benchmarks/KnowledgeWork/nights/D5-pricing-positioning_1.3.0/index.html)** · [Read it on the Morning Desk ↗](https://meterless.ai/Benchmarks/KnowledgeWork/) · [All examples](README.md)

> A three-tier pricing recommendation against the competitor table, with a revenue sanity check.

| Judge score | Winning model | Drafts raced | Drafts judged | Unattended | Words |
|---|---|---:|---:|---:|---:|
| 0.78 | Qwen2.5 14B | 6 | 2 | 26 min | 744 |

**Verified against the answer key**

- Revenue check right: 410 customers × 38 seats = 15,580 seats
- Today $171,380 → proposed $176,054 MRR (+$4,674)
- Three tiers, each with an upgrade trigger

**Proofs passed:** complete, not cut off; meets the length asked; every calculation re-computed.

### The race

| Attempt | Lane | Model | Started | Finished | Tokens | Passed proofs | Judge | Kept |
|---:|---|---|---:|---:|---:|---|---:|---|
| 1 | generalist | Qwen2.5 14B | 0 min | 5.3 min | 1,575 | no |  |  |
| 2 | router | MiniCPM5 1B | 0 min | 9.6 min | 4,931 | no |  |  |
| 3 | generalist | Qwen2.5 14B | 5.3 min | 10 min | 1,303 | yes | 0.78 | **winner** |
| 4 | router | MiniCPM5 1B | 9.6 min | 10.8 min | 1,460 | no |  |  |
| 5 | verifier | VibeThinker 3B | 0 min | 11.7 min | 2,055 | yes | 0.42 |  |
| 6 | vision | Qwen3.8 27B | 0 min | 25.9 min | 1,748 | no |  |  |

<details><summary>The brief it answered, verbatim</summary>

```text
You are advising the CEO of Tallyhawk, a startup selling expense-management software to companies with 20–300 employees. Recommend positioning and a pricing structure for the relaunch. Use the competitive and customer data below; label any assumption you make.

COMPETITOR TABLE (public list prices, per active user per month, annual billing)

| Vendor | Entry tier | Mid tier | Top tier | Notable |
|---|---|---|---|---|
| Expensa | $0 (up to 5 users, no cards) | $8 | $14 | strong mobile receipt capture; weak approvals |
| Brexio | $0 with their corporate card | $12 | custom | card-first; requires their card for free tier |
| Rampart | $0 with their card | — | $15 (plus tier) | card-first; strong accounting sync |
| Concurrence | — | $18 | custom | enterprise legacy; 6–10 week implementation |

TALLYHAWK TODAY
- Current single price: $11/user/month; 410 customers, median 38 users; logo churn 2.1%/month.
- Win/loss notes (last 60 deals): lost 14 to card-first "free" offers, 6 to Concurrence (multi-entity needs), won 23 on approval workflows and 2-day setup.
- Features: receipt OCR, multi-step approvals, per-diem, mileage, NetSuite/QuickBooks/Xero sync, multi-entity (beta), no corporate card (partnership possible in 6 months).
- Gross margin 78%; CAC payback 17 months (board wants under 12).

DELIVERABLE
1. A positioning statement (for / who / our product is / that / unlike) and the one sentence a sales rep says in the first minute.
2. A SWOT against this competitor set.
3. A 3-tier pricing recommendation (name, price, who it is for, what is in it, what the upgrade trigger is), with the reasoning, and explicitly what you would do about the "free with our card" competitors.
4. A simple revenue sanity check: if 60% of current customers land on the middle tier and 25% on the top tier at their current median seat count, what happens to MRR vs today? Show the arithmetic.
5. What to test in the next 60 days before committing, and the metric that would change your mind.

Length: 800–1,200 words, with tables where they help.
```

</details>

---

## The winning deliverable, verbatim

<!-- Copied unmodified from the published job. Model output keeps its own punctuation and any dates it invented. -->

### 1. Positioning Statement and Sales Pitch

**Positioning Statement:**
"For companies with 20-300 employees, Tallyhawk's expense-management software is a quick-to-implement, multi-entity solution that offers unparalleled approval workflows and seamless integrations, unlike its competitors who either require a proprietary corporate card or have long implementation times and complex setups."

**Sales Rep's Opening Sentence:**
"Tallyhawk offers a streamlined, cloud-based expense management solution designed specifically for mid-sized companies, providing faster setup, robust approval processes, and comprehensive integrations without the need for a proprietary card."

### 2. SWOT Analysis

**Strengths:**
- Quick implementation (2-day setup).
- Robust multi-step approval workflows.
- Seamless integrations with leading accounting platforms.
- High gross margin (78%).
- No dependency on proprietary cards.

**Weaknesses:**
- Single pricing model without differentiation.
- Current single price is higher than competitors offering free tiers (Expensa, Brexio, Rampart).
- Limited multi-entity functionality (beta stage).

**Opportunities:**
- Potential to partner with corporate card providers to offer an integrated solution.
- Expand into mid-market segments that require multi-entity support.
- Increase adoption in sectors where card-first solutions are not suitable.

**Threats:**
- Increased competition from companies offering free tiers (Expensa, Brexio, Rampart).
- Complex approval workflows may not appeal to all businesses.
- Customer churn (2.1% per month).

### 3. Pricing Recommendation

**Tier 1: Essentials**
- **Price:** $8/user/month
- **Who It Is For:** Small teams with fewer than 30 active users who require basic functionality.
- **What Is In It:** Basic receipt OCR, limited approval workflows, per-diem, mileage tracking, NetSuite/QuickBooks/Xero sync.
- **Upgrade Trigger:** When more than 30 users need access, or advanced features such as multi-entity management are required.

**Tier 2: Professional**
- **Price:** $11/user/month (current pricing remains)
- **Who It Is For:** Medium-sized teams (30-100 users) that require more sophisticated approval workflows and integrations.
- **What Is In It:** Full receipt OCR, advanced approval workflows, per-diem, mileage tracking, NetSuite/QuickBooks/Xero sync, multi-entity support (beta).
- **Upgrade Trigger:** When the organization scales beyond 100 users, or if there's a need for enhanced reporting and analytics capabilities.

**Tier 3: Enterprise**
- **Price:** $14/user/month
- **Who It Is For:** Larger teams (100-300 users) that need enterprise-level features such as custom reports, enhanced integrations, and comprehensive support.
- **What Is In It:** All features in Professional tier, plus custom reports, advanced analytics, enhanced support.
- **Upgrade Trigger:** When the organization exceeds 300 users, or if there’s a need for enterprise-scale solutions.

**Reasoning:**
- The tiered pricing structure aligns with different customer needs and scales with the organization's growth.
- The $8/user/month tier addresses the "free with our card" competitors by offering a competitive price point.
- The $14/user/month tier ensures high margins while catering to larger businesses with more sophisticated needs.
- The pricing aligns with current margins and aims to reduce churn by providing more value at different price points.

### 4. Revenue Sanity Check

**Current MRR Calculation:**
- Current users: 410 * 38 = 15,580 users
- Current MRR: 15,580 * $11 = $171,380

**Proposed MRR Calculation:**
- 60% on Tier 2 ($11): 15,580 * 0.60 = 9,348 users * $11/user/month = $102,828
- 25% on Tier 3 ($14): 15,580 * 0.25 = 3,895 users * $14/user/month = $54,530
- Remaining 15% on Tier 1 ($8): 15,580 * 0.15 = 2,337 users * $8/user/month = $18,696

**Total Proposed MRR:** $102,828 + $54,530 + $18,696 = $176,054

**Change in MRR:**
- Current MRR: $171,380
- Proposed MRR: $176,054
- **Difference:** $176,054 - $171,380 = $4,674

### 5. What to Test in the Next 60 Days Before Committing

**Tests:**
- **Free Trial Offers:** Offer a 30-day free trial with a card-first option to test customer interest in a card-free solution.
- **Pilot Partnership with Card Providers:** Partner with a corporate card provider to test an integrated solution in a small pilot group.
- **Customer Feedback on New Tiers:** Conduct surveys and one-on-one interviews with customers to gather feedback on the proposed pricing tiers.

**Metrics That Would Change Our Mind:**
- **Trial Conversion Rate:** If the free trial offers a high conversion rate (above 10%), consider offering a lower price tier.
- **Card Partnership Interest:** If 40% of free trial customers express interest in the integrated card solution, consider a partnership.
- **Customer Satisfaction Scores:** If customer satisfaction scores for the new tiers drop significantly (below 75%), reconsider the pricing structure.

By implementing these strategies and monitoring the key metrics, Tallyhawk can make data-driven decisions to optimize its product positioning and pricing strategy, ensuring long-term success in the competitive expense management software market.
