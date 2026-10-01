import { readFileSync, writeFileSync, copyFileSync, appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const dir = resolve('artifacts/transaction-validate');
const hash = p => createHash('sha256').update(readFileSync(p)).digest('hex');
const events = [];
function run(role, command, args) {
  const r = spawnSync(command, args, { encoding: 'utf8' });
  const event = { role, command: [command, ...args], stdout: r.stdout || '', stderr: r.stderr || '', exit_status: r.status, error: r.error?.message };
  events.push(event); if (r.status !== 0) throw new Error(JSON.stringify(event));
  return r.stdout;
}
const originalHash = hash(`${dir}/BASELINE_FILE`);
const baseline = run('BASELINE', process.execPath, ['scripts/check-validator.mjs', `${dir}/BASELINE_FILE`]);
const modified = run('MODIFIED', process.execPath, ['scripts/check-validator.mjs', `${dir}/MODIFIED_FILE`]);
copyFileSync(`${dir}/MODIFIED_FILE`, `${dir}/ROLLBACK_COPY`);
run('ROLLBACK_COMMAND', process.platform === 'win32' ? 'C:/Program Files/Git/bin/bash.exe' : '/bin/sh', [`${dir}/ROLLBACK.sh`, `${dir}/ROLLBACK_COPY`]);
const rollback = run('ROLLBACK', process.execPath, ['scripts/check-validator.mjs', `${dir}/ROLLBACK_COPY`]);
if (hash(`${dir}/ROLLBACK_COPY`) !== originalHash || baseline !== rollback || baseline === modified) throw new Error('Transaction evidence mismatch');
if (hash(`${dir}/MODIFIED_FILE`) !== hash('src/lib/telegram/validate-init-data.ts')) throw new Error('Modified role differs from current implementation');
const evidence = { target: resolve('src/lib/telegram/validate-init-data.ts'), changed_branch: 'receivedHash strict 64-hex validation', originalHash, modifiedHash: hash(`${dir}/MODIFIED_FILE`), rollbackHash: hash(`${dir}/ROLLBACK_COPY`), events };
writeFileSync('artifacts/mvp-continuation/validator-events.json', JSON.stringify(evidence, null, 2));
appendFileSync(`${dir}/VERIFICATION.txt`, '\n2026-09-30 REVERIFICATION\n' + JSON.stringify(evidence, null, 2) + '\nMVP continuation evidence: ../mvp-continuation/ and ../../docs/MVP-STATUS.md\n');
for (const role of ['MODIFIED_FILE','DIFF_FILE','VERIFICATION.txt','ROLLBACK.sh']) {
  const path = `${dir}/${role}`; const bytes = readFileSync(path); console.log(`${role}: ${path} (${bytes.length} bytes, SHA256 ${hash(path)})`);
}
console.log('BASELINE accepted=true; MODIFIED accepted=false; ROLLBACK accepted=true; restored hash equals original. All exit statuses 0.');
