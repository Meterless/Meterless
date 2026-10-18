# Security Policy

## Reporting a vulnerability

Report security issues privately to **sam@thedataplant.com**. Do not open a public issue for security vulnerabilities.

Include:

- The component affected (an engine spec, a doc, Nightshift, the Meterless Runtime, an app, or an experiment)
- Steps to reproduce
- Impact assessment if known

We will acknowledge reports as quickly as possible and coordinate a fix and disclosure timeline with you.

## Product vulnerabilities

Gaia, Relay, Swarms and the experiments ship from their own repos. Report app vulnerabilities privately through the security advisory form on the matching repo (`meterless/gaia`, `meterless/relay`, `meterless/swarms`, `meterless/dataplant`), or to the email above. Report Nightshift and Meterless Runtime issues to the email above.

## Scope notes

Meterless products execute locally, can automate desktop workflows, and serve other apps over a local OpenAI-compatible endpoint. Reports involving privilege escalation, sandbox escape, prompt-injection-driven execution, bypass of the runtime's bearer-token auth or hotspot mode, or exfiltration of local context, memory, receipts or job output are especially valuable.
