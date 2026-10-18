import { mkdir, readFile, writeFile, copyFile, rename, readdir, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, PUBLIC_FILES, generatedPage, recover } from './promo.mjs';

export async function build(root = ROOT, generateOnly = false) {
  await recover(root);
  const html = await generatedPage(root);
  if (generateOnly) {
    const file = resolve(root, 'index.html');
    await mkdir(resolve(root, '.promo-backups'), { recursive: true });
    await copyFile(file, resolve(root, '.promo-backups', `index-${Date.now()}.html`));
    await writeFile(file + '.tmp-promo', html);
    await rename(file + '.tmp-promo', file);
    return;
  }
  // Read every public asset before replacing any output; never copy the project tree.
  const assets = await Promise.all(PUBLIC_FILES.filter(f => f !== 'index.html').map(async name => [name, await readFile(resolve(root, name))]));
  const output = resolve(root, 'dist');
  await mkdir(output, { recursive: true });
  // Fail closed if unexpected directories exist instead of publishing old private files.
  for (const entry of await readdir(output, { withFileTypes: true })) {
    if (entry.isDirectory()) throw new Error('Folder dist berisi subfolder yang tidak dikenal. Pindahkan isinya sebelum build.');
    if (!PUBLIC_FILES.includes(entry.name)) await unlink(resolve(output, entry.name));
  }
  for (const [name, bytes] of assets) await writeFile(resolve(output, name), bytes);
  await writeFile(resolve(output, 'index.html'), html);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await build(ROOT, process.argv.includes('--generate-only'));
  console.log(process.argv.includes('--generate-only') ? 'HTML lokal diperbarui.' : 'Build berhasil: dist/ siap diterbitkan.');
}
