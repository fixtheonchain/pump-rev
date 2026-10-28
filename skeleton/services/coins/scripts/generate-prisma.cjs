// Cache the Prisma schema-generation executable in the workspace.
// The runtime client is Rust-free; this executable is used only by the generation CLI.
const { createRequire } = require('node:module');
const { createHash } = require('node:crypto');
const { mkdir, readFile, writeFile, chmod } = require('node:fs/promises');
const { resolve, dirname } = require('node:path');
const { gunzipSync } = require('node:zlib');
const { spawnSync } = require('node:child_process');

async function main() {
  const prismaRequire = createRequire(require.resolve('prisma/package.json'));
  const enginesRequire = createRequire(prismaRequire.resolve('@prisma/engines/package.json'));
  const { enginesVersion } = prismaRequire('@prisma/engines');
  const { getBinaryTargetForCurrentPlatform } = enginesRequire('@prisma/get-platform');
  const platform = await getBinaryTargetForCurrentPlatform();
  const executable = `schema-engine${platform === 'windows' ? '.exe' : ''}`;
  const filename = resolve(__dirname, '../../..', '.local/prisma', enginesVersion, platform, executable);
  let valid = false;
  try {
    const bytes = await readFile(filename);
    valid = createHash('sha256').update(bytes).digest('hex') === (await readFile(filename + '.sha256', 'utf8')).trim();
  } catch { /* Download a missing workspace-local tool. */ }
  if (!valid) {
    const artifact = `https://binaries.prisma.sh/all_commits/${enginesVersion}/${platform}/${executable}`;
    const [archiveResponse, checksumResponse] = await Promise.all([fetch(artifact + '.gz'), fetch(artifact + '.sha256')]);
    if (!archiveResponse.ok || !checksumResponse.ok) throw new Error('Could not download the official Prisma schema tool');
    const bytes = gunzipSync(Buffer.from(await archiveResponse.arrayBuffer()));
    const expected = (await checksumResponse.text()).trim().split(/\s/)[0];
    if (createHash('sha256').update(bytes).digest('hex') !== expected) throw new Error('Prisma schema tool checksum mismatch');
    await mkdir(dirname(filename), { recursive: true });
    await writeFile(filename, bytes);
    await writeFile(filename + '.sha256', expected);
    await chmod(filename, 0o755);
  }
  const cli = resolve(dirname(require.resolve('prisma/package.json')), 'build/index.js');
  const result = spawnSync(process.execPath, [cli, 'generate', '--schema', 'prisma/schema.prisma'], {
    cwd: resolve(__dirname, '..'), stdio: 'inherit', env: { ...process.env, PRISMA_SCHEMA_ENGINE_BINARY: filename },
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}
main().catch(error => { process.stderr.write(`Prisma generation failed: ${error.message}\n`); process.exitCode = 1; });

