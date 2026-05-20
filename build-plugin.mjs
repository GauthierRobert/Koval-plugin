#!/usr/bin/env node
// Materialize plugin/skills/ from ../skills/<skill>/ merged with ../skills/_shared/.
// Mirrors the merge logic in ../skills/package-skills.mjs so plugin distribution
// and Claude Desktop ZIPs ship the same content.
//
// Run:  node plugin/build-plugin.mjs

import {
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  rmSync,
  statSync,
} from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const PLUGIN_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = dirname(PLUGIN_DIR);
const SRC_SKILLS_DIR = join(REPO_ROOT, 'skills');
const SHARED_DIR = join(SRC_SKILLS_DIR, '_shared');
const OUT_SKILLS_DIR = join(PLUGIN_DIR, 'skills');

function walk(root, prefix = '') {
  const out = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const abs = join(root, entry.name);
    const rel = prefix ? prefix + '/' + entry.name : entry.name;
    if (entry.isDirectory()) out.push(...walk(abs, rel));
    else if (entry.isFile()) out.push({ relPath: rel, absPath: abs });
  }
  return out;
}

function materializeSkill(skillDir, sharedFiles) {
  const skillName = basename(skillDir);
  const merged = new Map();
  for (const f of sharedFiles) merged.set(f.relPath, { absPath: f.absPath, source: 'shared' });
  for (const f of walk(skillDir)) {
    if (merged.has(f.relPath) && merged.get(f.relPath).source === 'shared') {
      console.warn(`  ! ${skillName}/${f.relPath} overrides _shared copy`);
    }
    merged.set(f.relPath, { absPath: f.absPath, source: 'local' });
  }
  if (![...merged.keys()].includes('SKILL.md')) {
    throw new Error(`${skillName}: missing SKILL.md at the skill root`);
  }
  const outDir = join(OUT_SKILLS_DIR, skillName);
  for (const [relPath, { absPath }] of merged) {
    const dest = join(outDir, relPath);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, readFileSync(absPath));
  }
  return merged.size;
}

function main() {
  if (!existsSync(SRC_SKILLS_DIR) || !statSync(SRC_SKILLS_DIR).isDirectory()) {
    console.error('source skills dir not found at', SRC_SKILLS_DIR);
    process.exit(1);
  }

  if (existsSync(OUT_SKILLS_DIR)) rmSync(OUT_SKILLS_DIR, { recursive: true, force: true });
  mkdirSync(OUT_SKILLS_DIR, { recursive: true });

  const skillDirs = readdirSync(SRC_SKILLS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('_') && e.name !== 'dist' && e.name !== 'node_modules')
    .map((e) => join(SRC_SKILLS_DIR, e.name))
    .filter((d) => existsSync(join(d, 'SKILL.md')))
    .sort();

  if (skillDirs.length === 0) {
    console.error('No skill directories found under', SRC_SKILLS_DIR);
    process.exit(1);
  }

  const sharedFiles = existsSync(SHARED_DIR) ? walk(SHARED_DIR) : [];
  if (sharedFiles.length > 0) {
    console.log(`merging ${sharedFiles.length} shared file(s) into every skill.`);
  }

  let totalFiles = 0;
  for (const dir of skillDirs) {
    const skillName = basename(dir);
    const fileCount = materializeSkill(dir, sharedFiles);
    totalFiles += fileCount;
    console.log(`materialized ${skillName} (${fileCount} files)`);
  }
  console.log(`\n${skillDirs.length} skills · ${totalFiles} files · plugin/skills/`);
}

main();
