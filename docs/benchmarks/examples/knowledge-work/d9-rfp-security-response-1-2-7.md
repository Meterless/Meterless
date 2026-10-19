# Security RFP answers

Knowledge work benchmark · Nightshift 1.2.7 · Sep 26, 2026 · Sales · job `job_muio1nly09`

**[Replay this night in 3D ↗](https://meterless.ai/Benchmarks/KnowledgeWork/nights/D9-rfp-security-response_1.2.7/index.html)** · [Read it on the Morning Desk ↗](https://meterless.ai/Benchmarks/KnowledgeWork/) · [All examples](README.md)

> The security section of a hospital group's RFP, answered from the facts only.

| Judge score | Winning model | Drafts raced | Drafts judged | Unattended | Words |
|---|---|---:|---:|---:|---:|
| 0.85 | Qwen2.5 14B | 5 | 4 | 28 min | 292 |

**Verified against the answer key**

- Every fact matches the fact sheet
- SCIM on the roadmap (Q1 2027); HITRUST not claimed
- Hosting, RPO/RTO and DR test date stated exactly

**Proofs passed:** complete, not cut off; meets the length asked.

### The race

| Attempt | Lane | Model | Started | Finished | Tokens | Passed proofs | Judge | Kept |
|---:|---|---|---:|---:|---:|---|---:|---|
| 1 | router | MiniCPM5 1B | 0 min | 0.6 min | 173 | yes | 0.30 |  |
| 2 | generalist | Qwen2.5 14B | 0 min | 1.3 min | 320 | yes | 0.80 |  |
| 3 | generalist | Qwen2.5 14B | 1.3 min | 3 min | 453 | yes | 0.85 | **winner** |
| 4 | router | MiniCPM5 1B | 0.6 min | 5 min | 1,456 | no |  |  |
| 6 | vision | Qwen3.8 27B | 0 min | 26.9 min | 1,161 | yes | 0.75 |  |

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

**S1: Describe your certifications and attestations.**
Our platform holds a SOC 2 Type II certification for the period Jan-Dec 2025, and we sign Business Associate Agreements (BAAs) to comply with HIPAA regulations. We do not currently hold a HITRUST certification but plan to initiate the readiness assessment for certification in Q2 2027.

**S2: How is PHI encrypted at rest and in transit?**
Patient Health Information (PHI) is encrypted at rest using AES-256 with per-tenant data keys managed via AWS KMS, and in transit via TLS 1.2+ connections.

**S3: Do you support SCIM user provisioning?**
SCIM user provisioning is not yet supported but is planned for Q1 2027. We will provide the specific timeline and features for SCIM provisioning at that time.

**S4: What are your RPO and RTO, and when was DR last tested?**
Our Recovery Point Objective (RPO) is 15 minutes, and the Recovery Time Objective (RTO) is 4 hours. The most recent Disaster Recovery (DR) test was conducted on 2026-06-12.

**S5: Do you hold HITRUST certification?**
We do not currently hold a HITRUST certification, but we plan to initiate the readiness assessment for certification in Q2 2027.

**S6: Can the hospital retrieve audit logs, and for how long are they kept?**
The hospital can retrieve audit logs through our API. We retain these logs for one year.

**S7: List subprocessors that may access PHI.**
Subprocessors that may access PHI include AWS, Twilio (for SMS), and SendGrid (for email).

**S8: Can data be hosted in the EU?**
Data residency is currently limited to the United States, and we do not offer EU hosting.

**Questions requiring additional detail from a sales engineer:**
- Specific features and timeline for SCIM provisioning in Q1 2027.
- Specific HITRUST certification roadmap and expected completion dates.
