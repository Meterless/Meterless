# Security RFP answers

Knowledge work benchmark · Nightshift 1.2.9 · Sep 27, 2026 · Sales · job `job_mujswmoy09`

**[Replay this night in 3D ↗](https://meterless.ai/Benchmarks/KnowledgeWork/nights/D9-rfp-security-response_1.2.9/index.html)** · [Read it on the Morning Desk ↗](https://meterless.ai/Benchmarks/KnowledgeWork/) · [All examples](README.md)

> The security section of a hospital group's RFP, answered from the facts only.

| Judge score | Winning model | Drafts raced | Drafts judged | Unattended | Words |
|---|---|---:|---:|---:|---:|
| 0.92 | Qwen2.5 14B | 5 | 5 | 21 min | 286 |

**Verified against the answer key**

- Every fact matches the fact sheet
- SCIM Q1 2027, no HITRUST claim, US-only hosting
- RPO/RTO, DR date and log retention stated exactly

**Proofs passed:** complete, not cut off; meets the length asked.

### The race

| Attempt | Lane | Model | Started | Finished | Tokens | Passed proofs | Judge | Kept |
|---:|---|---|---:|---:|---:|---|---:|---|
| 1 | router | MiniCPM5 1B | 0 min | 1.2 min | 194 | yes | 0.35 |  |
| 2 | generalist | Qwen2.5 14B | 0 min | 1.7 min | 429 | yes | 0.92 | **winner** |
| 3 | router | MiniCPM5 1B | 1.2 min | 2.3 min | 192 | yes | 0.25 |  |
| 4 | generalist | Qwen2.5 14B | 1.7 min | 3.3 min | 447 | yes | 0.90 |  |
| 6 | vision | Qwen3.8 27B | 0 min | 20.1 min | 1,369 | yes | 0.85 |  |

<details><summary>The brief it answered, verbatim</summary>

```text
Draft our answers to the security section of a hospital group's RFP for our patient-scheduling SaaS. Answer each question in 60–120 words, factually, from the facts below only; where our honest answer is "no" or "partially", say so and state the compensating control or the dated roadmap item. Never claim a certification we do not hold. End with a list of any question where a sales engineer must add detail.

OUR FACTS
- Hosted on AWS us-east-1 and us-west-2 (warm standby); RPO 15 minutes, RTO 4 hours; last DR test 2026-06-12.
- SOC 2 Type II (report period Jan–Dec 2025), HIPAA: we sign BAAs; HITRUST: not certified (r2 assessment planned to start Q2 2027).
- Encryption: AES-256 at rest (KMS, per-tenant data keys), TLS 1.2+ in transit.
- SSO: SAML 2.0 and OIDC; SCIM provisioning: on the roadmap for Q1 2027.
- MFA enforced for all staff; customers can enforce MFA for their users.
- Pen test by an external firm yearly (last 2026-03); critical findings fixed within 14 days.
- Logs retained 1 year; customers can export audit logs via API.
- Data residency: US only; no EU hosting.
- Subprocessors: AWS, Twilio (SMS), SendGrid (email).

RFP QUESTIONS
S1 Describe your certifications and attestations.
S2 How is PHI encrypted at rest and in transit?
S3 Do you support SCIM user provisioning?
S4 What are your RPO and RTO, and when was DR last tested?
S5 Do you hold HITRUST certification?
S6 Can the hospital retrieve audit logs, and for how long are they kept?
S7 List subprocessors that may access PHI.
S8 Can data be hosted in the EU?
```

</details>

---

## The winning deliverable, verbatim

<!-- Copied unmodified from the published job. Model output keeps its own punctuation and any dates it invented. -->

**S1 Describe your certifications and attestations.**
Our system is SOC 2 Type II certified for the period Jan–Dec 2025 and we sign Business Associate Agreements (BAAs) under HIPAA. We plan to undergo a HITRUST certification readiness assessment in Q2 2027.

**S2 How is PHI encrypted at rest and in transit?**
PHI is encrypted at rest using AES-256 with KMS-managed data keys per tenant. In transit, it is protected via TLS 1.2+.

**S3 Do you support SCIM user provisioning?**
SCIM user provisioning is not currently supported but is on our roadmap for Q1 2027.

**S4 What are your RPO and RTO, and when was DR last tested?**
Our Recovery Point Objective (RPO) is 15 minutes, and Recovery Time Objective (RTO) is 4 hours. The last disaster recovery test was conducted on 2026-06-12.

**S5 Do you hold HITRUST certification?**
We do not currently hold HITRUST certification, but we plan to start a readiness assessment in Q2 2027.

**S6 Can the hospital retrieve audit logs, and for how long are they kept?**
Audit logs can be exported via API by the hospital and are retained for one year.

**S7 List subprocessors that may access PHI.**
Subprocessors that may access PHI include AWS, Twilio (SMS), and SendGrid (email).

**S8 Can data be hosted in the EU?**
No, data residency is currently limited to the United States; we do not offer EU hosting at this time.

**Questions requiring additional detail from a sales engineer:**
- S3: Provide more details on the roadmap for SCIM user provisioning.
- S5: Discuss the planned timeline and expected completion date for the HITRUST readiness assessment.
- S8: Explain the reasons for the current limitation on data hosting in the EU and any potential future changes.
