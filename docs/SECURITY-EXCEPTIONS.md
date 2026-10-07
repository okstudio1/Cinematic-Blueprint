# Security exceptions

Findings from automated security audits that have been reviewed and
knowingly skipped. Each entry records the finding, the reason it
is not load-bearing for this project's threat model, and the trigger
that would warrant revisiting.

Triage agents should treat entries here as "known skipped, do not
re-flag" rather than as a free pass to ignore the underlying class of
finding.

## How to add an exception

Document the finding (rule ID or advisory plus score), the date the decision
was made, the threat-model reasoning, and the concrete trigger that would
warrant revisiting. "Revisit when" should be observable, not aspirational:
"when X happens", not "eventually."

