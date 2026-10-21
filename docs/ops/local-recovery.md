# Production backup and isolated recovery

21 October 2026. Owner requested local copies only. No paid service or offsite upload.

## Installed operation

- Production is Supabase `zztiestaqjbsbjuzmbqp` (Dawat Production), served only by `https://dawat-client-pilot.netlify.app`.
- Development uses local project `dawat-local`, ports54321–54324. Recovery uses a separate disposable local project `dawat-recovery`, ports55321–55324 and app3104. Its bridge has a loopback binding; on Windows a project-scoped Docker CLI adapter also supplies explicit127.0.0.1port mappings before containers are created, because Docker Desktop ignored the bridge default during verification. The adapter uses the already-installed .NET compiler, inherits streams/arguments without a shell and changes neither global PATH nor Docker settings. Startup and restore inspect actual API/DB/inbox port bindings and refuse wildcards. Local SMTP goes only to the recovery inbox; never point a restored app at production SMTP.
- Windows task **Dawat Local Encrypted Backup** runs daily19:00, with missed-start recovery, overlap prevention and a15-minute limit. It runs as the existing signed-in Windows user, without storing that user's password. Docker Desktop must be running. This is a local Task Scheduler job, not a cloud job.
- Backup directory: `C:\Users\User\Documents\DawatBackups`. Each complete directory has encrypted manifest/payloads and a non-sensitive `receipt.json`. `status.json` reports the most recent attempt. A failed attempt never deletes the previous complete backup. No automatic pruning.
- Master key: `C:\Users\User\.dawat\backup-master.key`,32rawbytes. Directory/key/database-password file have Windows ACLs for this user and SYSTEM only. Keep the key separately from any copied encrypted archive. Losing it loses recovery capability. Local-only copies do not survive loss of this computer; this is the owner's explicit current choice.
- Private connection configuration: ignored `web/.env.recovery.local`; structure in `web/recovery/.env.recovery.example`. The production env/key ring comes from ignored `.env.netlify.pilot.local`. Never commit, screenshot or paste either populated file.

## Backup manually and inspect

From `web`, run `npm run backup:create`. It uses a certificate-verified TLS session pooler connection, an exported read-only PostgreSQL snapshot, PostgreSQL17pg_dump in an ephemeral digest-pinned official Docker image. The runner has no published ports, a read-only filesystem, no Linux capabilities and no-new-privileges; ordinary development containers do not need to be running. It never puts the database password in command arguments.

The snapshot contains application schema/data, Auth data, database migration history, Storage bucket/policies and actual object bytes, all retained guest AES key versions, deployment configuration and migration files. New archives record the Git source revision and Node version. Every encrypted file is authenticated and checked on disk before `.partial` is renamed complete. AES256GCM uses independent nonces and filename-associated authentication. Object count20,000/transfer1GiB and individual dump256MiB bounds prevent unbounded runs; review these against the free egress budget before larger use.

Check `Get-ScheduledTaskInfo -TaskName 'Dawat Local Encrypted Backup'` and the backup `status.json` after an important publication and at least daily during invitations. `LastTaskResult=0` plus a fresh complete receipt is the success evidence. There is no remote failure notification. If Windows/Docker is off, the next backup is delayed: no guaranteed24h recovery point. Current receipts are around3MiB of objects; production growth must be included in the Supabase free egress budget. Do not enable paid overages.

An interrupted run can leave `backup.lock` and `.partial`. Read its PID and confirm that process is gone before removing **only that lock**; keep partial directories for diagnosis. Never delete complete archives as part of this repair. Re-run manually and inspect the fresh receipt.

## Restore rehearsal

1. Preserve the encrypted archive and its separate master key. Use the recorded source revision and compatible Node/Postgres/Auth versions. `npm ci` in `web`.
2. `npm run recovery:start` creates the fixed isolated Docker target. This command refuses hosted targets and custom SMTP in the recovery config.
3. `npm run recovery:restore -- "C:\Users\User\Documents\DawatBackups\<complete-backup-id>"`. All encrypted entries are verified **before** any target mutation. A nonempty recovery database is refused; never redirect this command to production or ordinary development. A new drill requires a separately reviewed reset of this disposable recovery environment, not a source database reset.
4. Restore checks Auth column compatibility and API role flags, loads schema/data transactionally, compares all table counts/checksums, recreates private bucket/policies, uploads and downloads every restored object for SHA256 verification, and decrypts retained guest-link credentials for digest comparison. Only platform-owned `supabase_admin` default ACL statements are excluded because the ordinary restore role cannot alter them; application/table/function grants remain.
5. `npm run recovery:build`, `npm run recovery:app` in one terminal, then `npm run recovery:verify` in another. The HTTP suite signs in synthetic users through the **local inbox**, tests seller MFA/activation, two-owner denial, image limits/processing, publish, scoped links, RSVP/wishes/history/export and pause/rotation/revocation. It writes ignored `.artifacts/recovery-sandbox/restore-proof.json` and `e2e/result.json`.
6. Inspect restored UI before any actual disaster cutover. A new hosted disaster target needs a separately reviewed procedure, DNS/origin reconfiguration, external-email settings and access checks; this local script deliberately cannot write to it. Keep the last working application artifact; do not reverse data migrations blindly. Reapply any erasure decisions recorded after the snapshot before exposing recovered data.

## Scope and known limits

The final executed drill recovered55tables,39private objects/3,875,910bytes and4retained guest credentials, followed by the complete local HTTP user journey. No production data was overwritten. Copying database rows alone is not a photo backup.

Supabase-managed Auth/SMTP/project settings and the Gmail App Password are not database contents. Re-enter the shared SMTP credential privately if the hosted project is lost; retain current Bangla OTP template/config instructions in the existing runbook. Hosted JWT signing/root keys are provider-managed; clients must sign in again after a new-project disaster recovery. Vault secrets or Auth MFA factors cause this backup tool to fail closed until a platform-root-key recovery procedure is added; the current customer production project has neither. Local synthetic seller MFA does not imply a hosted seller account has been provisioned.

Daily local backup is installed and tested, but does not establish hosted point-in-time recovery, offsite durability, guaranteed RPO/RTO or actual physical-phone compatibility. Those promises must not be made to a customer.

After a drill, stop the local recovery app and run `supabase stop --workdir ../.artifacts/recovery-sandbox --project-id dawat-recovery --no-backup` from `web` to discard only this disposable restored-data volume. Preserve the encrypted archive, master key and non-sensitive proof files. Never use `--all` or target production.
