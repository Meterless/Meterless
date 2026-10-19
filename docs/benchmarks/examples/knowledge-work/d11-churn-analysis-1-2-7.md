# Churn cohort analysis

Knowledge work benchmark · Nightshift 1.2.7 · Sep 26, 2026 · Finance · job `job_muio1nrf0a`

**[Replay this night in 3D ↗](https://meterless.ai/Benchmarks/KnowledgeWork/nights/D11-churn-analysis_1.2.7/index.html)** · [Read it on the Morning Desk ↗](https://meterless.ai/Benchmarks/KnowledgeWork/) · [All examples](README.md)

> A one-page memo from a cohort retention table: what changed, why, and what to do.

| Judge score | Winning model | Drafts raced | Drafts judged | Unattended | Words |
|---|---|---:|---:|---:|---:|
| 0.90 | Qwen2.5 14B | 4 | 4 | 34 min | 628 |

**Verified against the answer key**

- 17 of 17 cohort retention figures match ground truth
- The Q3 cohort anomaly found and named

**Proofs passed:** complete, not cut off; figures traced to the brief.

### The race

| Attempt | Lane | Model | Started | Finished | Tokens | Passed proofs | Judge | Kept |
|---:|---|---|---:|---:|---:|---|---:|---|
| 1 | generalist | Qwen2.5 14B | 0 min | 3.7 min | 903 | yes | 0.85 |  |
| 2 | router | MiniCPM5 1B | 0 min | 5.6 min | 427 | yes | 0.35 |  |
| 4 | generalist | Qwen2.5 14B | 3.7 min | 7.5 min | 951 | yes | 0.90 | **winner** |
| 5 | router | MiniCPM5 1B | 5.6 min | 9.8 min | 584 | yes | 0.30 |  |

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

### Memo to the Head of Customer Success

Subject: Analysis of Customer Retention by Cohort

Dear [Head of Customer Success],

I am writing to provide you with a detailed analysis of our customer retention rates by cohort, as outlined in the table below. The data reveals key insights into how different groups of customers are retaining their subscriptions over time, which will be crucial for refining our customer success strategies and identifying anomalies.

#### Retention Curve Analysis
The retention curve for each cohort shows a steady decline in the number of active customers over time, with each cohort retaining fewer customers as they progress through the months. Notably, the curve for the Q3 2025 cohort has a more pronounced drop compared to other cohorts, indicating a potential anomaly.

#### Retention Percentage Calculation
Retention percentages were calculated using the formula:
\[ \text{Retention Percentage} = \left( \frac{\text{Number of customers remaining active at Month N}}{\text{Number of customers signed up}} \right) \times 100 \]

| Cohort | Signed up | M1 Retention % | M3 Retention % | M6 Retention % | M9 Retention % | M12 Retention % |
|---|---|---|---|---|---|---|
| 2025-Q1 | 120 | 95.0% | 87.5% | 80.0% | 75.0% | 71.7% |
| 2025-Q2 | 140 | 95.0% | 86.4% | 78.6% | 73.6% | 70.0% |
| 2025-Q3 | 160 | 93.8% | 80.0% | 65.0% | 59.4% | — |
| 2025-Q4 | 150 | 95.3% | 87.3% | 79.3% | — | — |
| 2026-Q1 | 175 | 96.0% | 88.6% | — | — | — |

#### Anomalous Cohort
The Q3 2025 cohort stands out as the most anomalous due to a significant drop in retention rates between Months 3 and 6. Specifically, the cohort retained 80.0% of customers at Month 3, which dropped to 65.0% by Month 6. This anomaly is significant given the size of the cohort (160 customers) and the steep decline observed.

#### Explanations for Anomalies
The data can support the following explanations:
1. **Guided Onboarding Flow**: The introduction of a new guided onboarding flow on July 1, 2025, may have affected the Q3 2025 cohort's initial experience, potentially leading to higher churn.
2. **Pricing Increase**: The 12% increase in pricing for new customers on October 1, 2025, could have influenced the retention of customers who signed up during Q3 2025, especially if they were sensitive to price changes.

The data cannot support:
1. **Customer Service Quality**: While changes in customer service could affect retention, the data provided does not include specific metrics related to customer service quality.
2. **Product Usage Metrics**: Without detailed usage statistics, it is challenging to determine if reduced retention is linked to lower product engagement.

#### Next Steps
To address these anomalies and improve retention, I recommend the following steps:

1. **Conduct Customer Surveys**: Target customers from the Q3 2025 cohort who churned between Months 3 and 6 with detailed surveys to understand their reasons for leaving. Measure the response rate and compare it against previous survey data. Aim for a 20% response rate.
2. **Analyze Onboarding Feedback**: Collect feedback on the new guided onboarding process from the Q3 2025 cohort. Focus on identifying pain points and areas for improvement. Track the number of positive feedback submissions and compare it to other cohorts. Aim for at least 100 positive feedback submissions.
3. **Pricing Experiment**: Conduct a pilot program to offer a price discount to customers from the Q3 2025 cohort who are still active. Monitor the retention rate improvement post-intervention compared to the current rate for this cohort. Aim for a 10% increase in retention rates.

Please review the analysis and let me know if there are any questions or further actions you would like to take.

Best regards,

[Your Name]  
[Your Position]
