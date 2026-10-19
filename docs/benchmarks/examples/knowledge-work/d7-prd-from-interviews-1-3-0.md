# PRD from customer interviews

Knowledge work benchmark · Nightshift 1.3.0 · Sep 28, 2026 · Product · job `job_mul0krvp0c`

**[Replay this night in 3D ↗](https://meterless.ai/Benchmarks/KnowledgeWork/nights/D7-prd-from-interviews_1.3.0/index.html)** · [Read it on the Morning Desk ↗](https://meterless.ai/Benchmarks/KnowledgeWork/) · [All examples](README.md)

> A product requirements document built from five interview notes.

| Judge score | Winning model | Drafts raced | Drafts judged | Unattended | Words |
|---|---|---:|---:|---:|---:|
| 0.78 | Qwen2.5 14B | 5 | 4 | 21 min | 546 |

**Verified against the answer key**

- 15 of 18 PRD checklist items
- Every problem traced to a specific interview
- User stories in Given / When / Then form

### The race

| Attempt | Lane | Model | Started | Finished | Tokens | Passed proofs | Judge | Kept |
|---:|---|---|---:|---:|---:|---|---:|---|
| 1 | generalist | Qwen2.5 14B | 0 min | 3 min | 908 | no | 0.78 | **winner** |
| 2 | router | MiniCPM5 1B | 0 min | 4.1 min | 466 | no | 0.28 |  |
| 3 | generalist | Qwen2.5 14B | 3 min | 6.5 min | 1,159 | no | 0.68 |  |
| 4 | router | MiniCPM5 1B | 4.1 min | 8.9 min | 608 | no | 0.22 |  |
| 6 | vision | Qwen3.8 27B | 0 min | 20.3 min | 730 | no |  |  |

<details><summary>The brief it answered, verbatim</summary>

```text
Turn these customer interview notes into a one-page product requirements document for the "approval delegation" feature of our spend-management product. Sections: Problem · Who has it (with evidence from the notes) · Goals and non-goals · User stories with acceptance criteria (Given/When/Then) · Edge cases · Success metrics (with a baseline we must measure first) · Open questions. Cite the interview (I1–I5) behind every problem statement. Do not invent requirements the notes don't support; list them under open questions instead.

NOTES
I1 (Controller, 400-person manufacturer): "When our VP is travelling, 60 purchase requests pile up. People email me screenshots to approve instead. Audit hates that." Wants a named backup for a date range. Must show in the audit trail who approved "on behalf of" whom.
I2 (Finance ops lead, 120-person agency): "Delegation exists in our old tool but it never expires — someone was still approving for a person who left in March." Wants mandatory end date, max 30 days.
I3 (CFO, 900-person retailer): "A delegate must never approve their own request. And above $50k it should still go to the original approver or the CFO." Also: delegation should not be chainable (A→B→C).
I4 (AP clerk, 60-person SaaS): Doesn't approve anything; complains that requesters don't know who to chase. Wants the requester to see "Approver away until 12 Oct — delegated to Sam".
I5 (IT admin, 400-person manufacturer, same company as I1): "It needs to work with our Okta groups." Unclear whether they mean delegation to a group or provisioning of users.
```

</details>

---

## The winning deliverable, verbatim

<!-- Copied unmodified from the published job. Model output keeps its own punctuation and any dates it invented. -->

### Product Requirements Document for Approval Delegation Feature

**Problem:** Users struggle with approving purchase requests when their primary approvers are unavailable due to travel or leave. This leads to inefficiencies, potential compliance issues, and a lack of transparency in the approval process.

**Who has it:**
- **I1:** A 400-person manufacturer where the VP's absence results in a backlog of 60 purchase requests.
- **I2:** A 120-person agency where the existing delegation feature lacks an expiration date, leading to unauthorized approvals.
- **I3:** A 900-person retailer concerned about self-approval and chainable delegation.
- **I4:** A 60-person SaaS company where requesters are confused about who to chase for approval.
- **I5:** Another user from the same 400-person manufacturer as I1, who mentions integration with Okta groups.

**Goals and Non-goals:**
- **Goals:**
  - Enable users to delegate approval authority for a specific date range.
  - Ensure that the delegation is time-bound with a maximum duration of 30 days.
  - Prevent delegates from approving their own requests.
  - Avoid chainable delegation (i.e., A→B→C).
  - Allow requesters to see delegation status and who is currently delegated to.
  - Integrate with Okta groups (if applicable).
- **Non-goals:**
  - Automatically assign new delegates without user input.
  - Allow delegation for more than 30 days without renewal.

**User Stories with Acceptance Criteria (Given/When/Then):**

1. **Delegate Approval Authority for a Specific Date Range**
   - *Given* the primary approver is unavailable,
   - *When* they set up a delegation,
   - *Then* the system should allow them to specify a delegate and a start/end date for the delegation.

2. **Prevent Self-Approval**
   - *Given* a delegate attempts to approve their own request,
   - *When* they click the approval button,
   - *Then* the system should display an error message and not proceed with the approval.

3. **Prevent Chainable Delegation**
   - *Given* a delegate is set up for a specific user,
   - *When* that delegate attempts to further delegate,
   - *Then* the system should prevent this action and display an error message.

4. **Display Delegation Status to Requesters**
   - *Given* the primary approver is delegated,
   - *When* a requester views the approval status,
   - *Then* they should see information indicating who is currently delegated to and the end date of the delegation.

5. **Audit Trail Shows Delegation**
   - *Given* a delegation is set up,
   - *When* an approval is made,
   - *Then* the audit trail should show the primary approver and the delegate who approved on their behalf.

**Edge Cases:**
- Delegation to a group instead of an individual (I5).
- What happens when the original approver returns before the delegation ends?
- How to handle scenarios where the delegate leaves the company before the delegation ends.

**Success Metrics (with Baseline):**
- **Metric:** Number of approvals processed during a primary approver's absence.
  - **Baseline:** Number of approvals processed when primary approvers are present and active.
- **Metric:** Reduction in audit trail errors and compliance issues.
  - **Baseline:** Frequency of audit trail errors and compliance issues in the absence of delegation functionality.

**Open Questions:**
- Should the system allow delegation to groups or only individuals?
- How should the system handle the scenario where a delegate leaves the company during the delegation period?
- Can the system automatically renew delegations if the primary approver does not return before the delegation's end date?
