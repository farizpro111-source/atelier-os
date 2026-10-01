import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const results = [];
for (const task of ['lint', 'test', 'build', 'typecheck', 'test:e2e']) {
  const args = process.platform === 'win32' ? ['/d', '/s', '/c', `npm.cmd run ${task}`] : ['run', task];
  const r = spawnSync(process.platform === 'win32' ? 'cmd.exe' : 'npm', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  results.push({ command: `npm run ${task}`, stdout: r.stdout || '', stderr: r.stderr || '', exit_status: r.status, error: r.error?.message });
  writeFileSync('artifacts/mvp-continuation/final-checks.json', JSON.stringify(results, null, 2));
  process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || '');
  if (r.status !== 0) process.exit(r.status || 1);
}
