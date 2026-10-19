# Hiring pack

Knowledge work benchmark · Nightshift 1.2.9 · Sep 27, 2026 · People · job `job_mujswnul0g`

**[Replay this night in 3D ↗](https://meterless.ai/Benchmarks/KnowledgeWork/nights/D10-hiring-pack_1.2.9/index.html)** · [Read it on the Morning Desk ↗](https://meterless.ai/Benchmarks/KnowledgeWork/) · [All examples](README.md)

> Job description, interview loop, scorecard and screening questions for a senior CSM.

| Judge score | Winning model | Drafts raced | Drafts judged | Unattended | Words |
|---|---|---:|---:|---:|---:|
| 0.92 | Qwen3.8 27B | 6 | 4 | 28 min | 1,237 |

**Verified against the answer key**

- Salary band, variable, remote-US exactly as briefed
- 45 accounts / $2.8M / 110% NRR threaded through the role
- Four distinct interview stages with red flags

**Proofs passed:** complete, not cut off.

### The race

| Attempt | Lane | Model | Started | Finished | Tokens | Passed proofs | Judge | Kept |
|---:|---|---|---:|---:|---:|---|---:|---|
| 1 | generalist | Qwen2.5 14B | 0 min | 5 min | 1,669 | yes | 0.72 |  |
| 2 | router | MiniCPM5 1B | 0 min | 5 min | 283 | yes |  |  |
| 3 | router | MiniCPM5 1B | 5 min | 5.7 min | 715 | yes | 0.28 |  |
| 4 | verifier | VibeThinker 3B | 0 min | 6.3 min | 224 | no |  |  |
| 5 | generalist | Qwen2.5 14B | 5 min | 8.6 min | 1,554 | yes | 0.65 |  |
| 6 | vision | Qwen3.8 27B | 0 min | 25.9 min | 2,110 | yes | 0.92 | **winner** |

<details><summary>The brief it answered, verbatim</summary>

```text
Create the hiring pack for a "Senior Customer Success Manager — Mid-Market" at a 70-person B2B analytics company. Deliverables:
1. Job description (≤ 450 words): the outcomes expected in the first 90 days and first year, responsibilities, must-haves vs nice-to-haves, salary range $115k–$135k + 15% variable, remote US, and an inclusive-language check (no "rockstar", no years-of-experience inflation beyond what the role needs).
2. A structured interview plan: 4 stages, who runs each, what each stage assesses (no two stages assess the same competency).
3. A scorecard for the case-study stage: 4 competencies, each with a 1–4 rubric with observable behaviours per level.
4. Five behavioural interview questions with what a strong answer contains and one red flag each.

Context: portfolio of 45 accounts, $2.8M ARR under management, target net revenue retention 110%, the team uses Gainsight and Salesforce, and the biggest current problem is late renewal risk detection (3 surprise churns last quarter).
```

</details>

---

## The winning deliverable, verbatim

<!-- Copied unmodified from the published job. Model output keeps its own punctuation and any dates it invented. -->

# Hiring Pack: Senior Customer Success Manager — Mid-Market

## 1. Job Description

**Role:** Senior Customer Success Manager — Mid-Market
**Location:** Remote (US)
**Salary:** $115,000 – $135,000 base + 15% variable compensation

**About Us**
We are a 70-person B2B analytics company helping mid-market organizations transform raw data into actionable insights. We value clarity, proactive problem-solving, and genuine partnership over reactive ticket handling.

**The Role**
You will own a portfolio of approximately 45 mid-market accounts, managing roughly $2.8M in Annual Recurring Revenue (ARR). Your primary objective is to drive customer value and ensure net revenue retention (NRR) targets of 110% are met. You will work closely with Sales, Product, and Support to identify risks early and champion our customers’ success.

**First 90 Days: Outcomes**
*   Complete a deep-dive audit of your assigned portfolio to identify top 10 at-risk accounts based on usage data, sentiment, and contract history.
*   Establish regular cadence with key stakeholders in all 45 accounts.
*   Implement a standardized risk-detection workflow in Gainsight to flag renewal risks 90 days before contract expiry.
*   Conduct onboarding reviews for any newly closed deals in the pipeline.

**First Year: Outcomes**
*   Achieve 110% NRR for your portfolio.
*   Reduce surprise churn to zero by improving early-warning signals and intervention strategies.
*   Identify and drive at least two expansion opportunities per quarter through upselling or cross-selling.
*   Contribute to product roadmap by synthesizing feedback from mid-market customers.

**Responsibilities**
*   Own the full customer lifecycle from onboarding through renewal and expansion.
*   Monitor health scores in Gainsight and Salesforce; proactively engage with accounts showing declining usage or sentiment.
*   Develop and execute account-specific success plans aligned with customer business goals.
*   Collaborate with Sales to prepare for renewal conversations and identify expansion potential.
*   Act as the voice of the customer, translating insights into actionable feedback for Product and Engineering.

**Must-Haves**
*   Proven experience managing mid-market B2B SaaS portfolios ($1M+ ARR).
*   Demonstrated success in meeting or exceeding NRR targets.
*   Proficiency in CRM and CSM tools (Salesforce and Gainsight preferred).
*   Strong data literacy to analyze usage metrics and identify risk signals.
*   Excellent written and verbal communication skills for remote collaboration.

**Nice-to-Haves**
*   Experience in the analytics or data science industry.
*   Certification in Customer Success (e.g., CSM, CSCP).
*   Experience building or optimizing CSM playbooks.

**Inclusive Language Check**
*   No terms like "rockstar," "ninja," or "guru" used.
*   Experience requirements focused on demonstrated outcomes (NRR, portfolio size) rather than arbitrary years of experience.
*   Language emphasizes partnership and problem-solving over "hustle" culture.

---

## 2. Structured Interview Plan

| Stage | Runner | Assessment Focus |
| :--- | :--- | :--- |
| **1. Screen** | Recruiter | **Logistics & Culture Fit:** Verify remote work setup, salary expectations, communication style, and alignment with company values (clarity, proactivity). |
| **2. Hiring Manager** | CSM Lead | **Strategic Portfolio Management:** Ability to prioritize a large portfolio, define success metrics, and align CSM activities with business revenue goals (NRR). |
| **3. Peer/Cross-Functional** | Sales Manager + Product Manager | **Cross-Functional Collaboration:** Effectiveness in partnering with Sales on renewals/expansions and translating customer feedback into product insights. |
| **4. Case Study** | CSM Lead + VP of Customer Success | **Analytical Problem-Solving:** Ability to diagnose churn risk, interpret data, and propose actionable intervention strategies. |

*Note: No two stages assess the same core competency. Stage 2 focuses on strategy; Stage 3 on collaboration; Stage 4 on analysis.*

---

## 3. Case Study Scorecard

**Case Study Prompt:** *Given a sample account with declining usage, negative sentiment in recent calls, and a renewal in 60 days, identify the risk, propose an intervention plan, and outline how you would track success.*

| Competency | 1 (Does Not Meet) | 2 (Meets Some) | 3 (Meets) | 4 (Exceeds) |
| :--- | :--- | :--- | :--- | :--- |
| **Risk Identification** | Ignores data or relies solely on gut feeling. Fails to link usage decline to churn risk. | Identifies obvious risks but misses nuanced signals (e.g., sentiment vs. usage). | Correctly identifies key risk factors using provided data. Proposes logical initial checks. | Systematically analyzes all data points. Identifies root cause hypotheses beyond surface-level metrics. Prioritizes risks effectively. |
| **Intervention Strategy** | Proposes generic advice (e.g., "check in with them"). No specific actions tied to the problem. | Suggests relevant actions but lacks specificity or customization to the account’s context. | Develops a clear, step-by-step plan tailored to the account’s specific pain points. Includes stakeholder mapping. | Creates a multi-channel, personalized plan. Anticipates objections. Includes contingency plans if initial outreach fails. |
| **Data Interpretation** | Cannot explain how metrics relate to each other. Misinterprets basic trends. | Understands individual metrics but fails to synthesize them into a coherent story. | Accurately interprets usage, sentiment, and health scores to build a narrative. | Uses data to quantify potential impact. Identifies correlations and leverages benchmarks to strengthen the case. |
| **Execution & Tracking** | No plan for follow-up or success measurement. | Mentions tracking but lacks specific KPIs or timelines. | Defines clear success metrics and a timeline for follow-up. | Establishes a feedback loop with measurable checkpoints. Proposes how to update health scores in Gainsight based on interventions. |

---

## 4. Behavioral Interview Questions

### Q1: Tell me about a time you detected a churn risk early and saved the account.
*   **Strong Answer Contains:** Specific data points that signaled risk (e.g., drop in logins, negative NPS), the specific actions taken (e.g., executive sponsor call, tailored use-case workshop), and the measurable outcome (e.g., renewal signed, expansion added).
*   **Red Flag:** Blames the customer for not engaging, or fails to mention any proactive data analysis.

### Q2: Describe a situation where you had to deliver bad news to a customer. How did you handle it?
*   **Strong Answer Contains:** Empathy and transparency. Acknowledges the customer’s frustration. Focuses on solutions or next steps rather than just apologizing. Maintains professionalism and protects the relationship.
*   **Red Flag:** Becomes defensive, shifts blame to other teams, or avoids discussing the emotional impact on the customer.

### Q3: How do you prioritize your time when managing a large portfolio of 45+ accounts?
*   **Strong Answer Contains:** Uses a tiered or health-score-based system. Mentions automation or templating for low-risk accounts. Emphasizes deep engagement for high-value or at-risk accounts. Demonstrates balance between proactive and reactive tasks.
*   **Red Flag:** Admits to being "overwhelmed" without a system, or treats all accounts with equal intensity regardless of risk/value.

### Q4: Give an example of when you disagreed with a Sales colleague on a customer’s needs. How did you resolve it?
*   **Strong Answer Contains:** Focuses on the customer’s best interest. Uses data to support their position. Seeks a collaborative solution rather than a win-lose argument. Maintains a positive relationship with the Sales team.
*   **Red Flag:** Dismisses Sales as "only focused on money," or capitulates without trying to advocate for the customer’s long-term success.

### Q5: Tell me about a time you used customer feedback to influence a product decision.
*   **Strong Answer Contains:** Specific feedback collected. How it was synthesized and presented to Product. The outcome (e.g., feature released, roadmap adjusted) and the impact on customer satisfaction or retention.
*   **Red Flag:** Claims to have "always" influenced product but provides no concrete example, or blames Product for ignoring feedback without showing effort to advocate.
