# Incident-response runbook

## Triage

1. Declare an incident, timestamp it, and name an incident lead.
2. Record symptoms, affected routes/frameworks, first known revision, and user impact.
3. Freeze deployments and preserve logs, receipts, manifests, and deployed artifact identity.
4. Check whether the failure is serving, emitted runtime, evidence corruption, canonical-source mismatch, or credential/security exposure.

## Contain

For a release regression, use the approved [rollback procedure](../how-to/rollback.md). Production commands, contacts, monitoring locations, and account identifiers are pending operations authority; do not infer them from `wrangler.jsonc`.

For suspected security exposure, rotate affected credentials through the owning platform and follow [SECURITY.md](../../SECURITY.md). Do not commit secrets or sensitive incident data.

## Recover and close

Verify representative routes and revision/receipt alignment, monitor for recurrence, and communicate recovery. Preserve a timeline and write a follow-up covering trigger, detection gap, impact, corrective actions, owners, and due dates. Regenerate evidence only after containment; never rewrite historical evidence to conceal the failure.
