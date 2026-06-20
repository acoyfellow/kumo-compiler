# Security policy

## Reporting

No private reporting address or response SLA is defined in this repository. Until an organizational security channel is documented, report through the repository's private maintainer/security escalation path; do not open a public issue containing an exploit, secret, personal data, or sensitive infrastructure detail. Maintainers should add the approved contact and SLA when supplied.

## Scope and handling

Treat dependency integrity, canonical package provenance, generated artifact tampering, Worker credentials, and unsafe emitted markup/behavior as security-relevant. Never commit tokens, account IDs that are intended to be private, production logs with user data, or unredacted incident evidence.

Use `npm ci` so the lockfile governs installation. Review provenance and receipt hash changes. Evidence hashes provide integrity binding, not a security review or a signature.

For deletion of compromised or sensitive material, follow [DELETION.md](DELETION.md) and coordinate history/cache removal with repository and deployment owners.
