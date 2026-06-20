# Deletion policy

Generated evidence is useful for auditability, but secrets, personal data, licensed material that cannot be retained, and unsafe artifacts must not remain merely because they are evidence.

## Request and decision

Record what must be deleted, why, scope, authority, and retention/legal constraints through the approved private maintainer channel. No owner, SLA, backup retention, or production deletion command is defined at this revision; obtain those facts before promising erasure.

## Remove

1. Stop generation or ingestion at the source.
2. Remove the material from the current tree and replace references with a non-sensitive explanation where appropriate.
3. If history contains sensitive data, coordinate history rewriting and credential rotation; a normal commit does not erase history.
4. Coordinate deletion from CI artifacts, package registries, deployed Worker/assets, logs, caches, mirrors, and backups according to each system's approved procedure.
5. Regenerate affected manifests/receipts/status rather than hand-editing hashes.
6. Verify absence at each in-scope location and record exceptions and expiry dates.

Deletion can invalidate evidence. Mark affected claims unproved until fresh, non-sensitive evidence passes the release gate.
