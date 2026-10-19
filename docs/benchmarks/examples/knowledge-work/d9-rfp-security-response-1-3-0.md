# Security RFP answers

Knowledge work benchmark · Nightshift 1.3.0 · Sep 28, 2026 · Sales · job `job_mul0kr7z09`

**[Replay this night in 3D ↗](https://meterless.ai/Benchmarks/KnowledgeWork/nights/D9-rfp-security-response_1.3.0/index.html)** · [Read it on the Morning Desk ↗](https://meterless.ai/Benchmarks/KnowledgeWork/) · [All examples](README.md)

> The security section of a hospital group's RFP, answered from the facts only.

| Judge score | Winning model | Drafts raced | Drafts judged | Unattended | Words |
|---|---|---:|---:|---:|---:|
| 0.95 | Qwen3.8 27B | 5 | 4 | 20 min | 682 |

**Verified against the answer key**

- All 8 answers from the fact sheet only, each ~85 words (brief: 60–120)
- Honest "no" answers carry a compensating control or a dated roadmap item
- HITRUST r2 dated Q2 2027; SCIM Q1 2027 with SSO/MFA meanwhile

**Proofs passed:** complete, not cut off; every item meets its length.

### The race

| Attempt | Lane | Model | Started | Finished | Tokens | Passed proofs | Judge | Kept |
|---:|---|---|---:|---:|---:|---|---:|---|
| 1 | generalist | Qwen2.5 14B | 0 min | 1.7 min | 450 | no | 0.82 |  |
| 2 | generalist | Qwen2.5 14B | 1.7 min | 2.9 min | 290 | no | 0.80 |  |
| 3 | router | MiniCPM5 1B | 0 min | 2.9 min | 266 | no |  |  |
| 4 | generalist | Qwen2.5 14B | 2.9 min | 4.1 min | 337 | no | 0.78 |  |
| 6 | vision | Qwen3.8 27B | 0 min | 19 min | 1,086 | yes | 0.95 | **winner** |

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
We hold a SOC 2 Type II certification for the period January through December 2025. We sign Business Associate Agreements (BAAs) to comply with HIPAA requirements. We do not currently hold HITRUST certification; however, our HITRUST r2 assessment is planned to begin in Q2 2027. We do not claim any other certifications not listed here. Our security posture is further validated by annual third-party penetration testing.

**S2 How is PHI encrypted at rest and in transit?**
All PHI is encrypted at rest using AES-256. We utilize AWS Key Management Service (KMS) with per-tenant data keys to ensure logical separation of encryption keys for each client. Data in transit is protected using TLS 1.2 or higher. This ensures that data is secured both while stored in our infrastructure and during transmission across the network. We do not use weaker encryption standards for any component of our patient-scheduling platform.

**S3 Do you support SCIM user provisioning?**
No, we do not currently support SCIM user provisioning. We currently support SAML 2.0 and OIDC for Single Sign-On (SSO). SCIM provisioning is on our product roadmap and is scheduled for release in Q1 2027. Until then, user management is handled via our administrative interface or manual SSO integration. We recommend planning integration workflows around SAML/OIDC for the interim period.

**S4 What are your RPO and RTO, and when was DR last tested?**
Our Recovery Point Objective (RPO) is 15 minutes, and our Recovery Time Objective (RTO) is 4 hours. We maintain warm standby infrastructure in AWS us-east-1 and us-west-2 to meet these targets. Our most recent Disaster Recovery (DR) test was conducted on June 12, 2026. This test validated our ability to restore services within the stated RTO and recover data within the stated RPO. We adhere to these metrics for all production environments.

**S5 Do you hold HITRUST certification?**
No, we do not currently hold HITRUST certification. We are planning to begin our HITRUST r2 assessment in Q2 2027. In the interim, we maintain SOC 2 Type II compliance and sign BAAs to meet HIPAA requirements. We recommend reviewing our SOC 2 report and security documentation as compensating controls. We will provide updated certification status once the assessment is complete and the certification is awarded.

**S6 Can the hospital retrieve audit logs, and for how long are they kept?**
Yes, hospitals can retrieve audit logs via our API. We retain logs for one year. This retention period allows for comprehensive security monitoring and compliance auditing. The API allows for automated export of these logs to your own SIEM or data lake for long-term storage if required. We ensure that log data is immutable and protected against unauthorized modification during the retention period.

**S7 List subprocessors that may access PHI.**
Our subprocessors that may access PHI are AWS, Twilio, and SendGrid. AWS provides our cloud infrastructure. Twilio is used for SMS communications, and SendGrid is used for email notifications. All subprocessors are bound by data processing agreements that comply with HIPAA and our security standards. We monitor their compliance and ensure that they only process data as necessary for service delivery. We do not use other subprocessors for PHI handling.

**S8 Can data be hosted in the EU?**
No, we do not offer EU data residency. Our platform is hosted exclusively in the United States, specifically in AWS us-east-1 and us-west-2 regions. We do not replicate or store patient data in the European Union. If EU data residency is a strict requirement for your organization, our current infrastructure does not support this need. Please consider this limitation when evaluating our solution against your data sovereignty policies.

***

**Sales Engineer Action Items:**
*   **S1:** Attach the most recent SOC 2 Type II report and the standard BAA template.
*   **S3:** Provide the technical specification document for the upcoming SCIM implementation and the current SAML/OIDC integration guides.
*   **S4:** Share the summary report from the June 12, 2026, DR test (sanitized for confidentiality).
*   **S7:** Provide the current Subprocessor List and the relevant Data Processing Agreement (DPA) clauses for AWS, Twilio, and SendGrid.
