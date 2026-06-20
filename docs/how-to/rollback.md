# Roll back

Rollback is a production operation; its platform command and owner are pending.

1. Stop further releases and announce the rollback decision.
2. Select the last known-good immutable revision and its evidence receipts. Do not rebuild old source and assume identical output.
3. Obtain authorization from the deployment owner.
4. Restore that exact artifact using the platform's approved rollback mechanism **once documented**.
5. Verify availability, Astro routes, component routes, and receipt/revision alignment.
6. Record times, revisions, operator, observations, and any lost data.

If an exact artifact cannot be restored, keep the service contained and escalate; do not improvise a production command. Follow [incident response](../runbooks/incident-response.md).
