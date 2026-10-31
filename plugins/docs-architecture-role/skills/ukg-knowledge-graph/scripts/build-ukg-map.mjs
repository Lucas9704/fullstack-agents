#!/usr/bin/env node
/**
 * Zero-dependency UKG Graph Inventory & Mermaid Topology Builder.
 * Usage: node build-ukg-map.mjs [docs-dir-path]
 *
 * Scans a UKG Markdown directory, extracts all typed nodes and their [[wikilinks]] /
 * depends_on edges, and outputs a JSON summary + a Mermaid flowchart LR diagram.
 */

import fs from 'node:fs';
import path from 'node:path';

const targetDir = path.resolve(process.argv[2] || path.join(process.cwd(), 'docs'));

if (!fs.existsSync(targetDir)) {
  console.error(`Directory not found: ${targetDir}`);
  process.exit(1);
}

const IGNORED_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build']);

function collectMarkdownFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir)) {
    if (IGNORED_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) collectMarkdownFiles(full, results);
    else if (stat.isFile() && full.endsWith('.md')) results.push(full);
  }
  return results;
}

function parseNode(file) {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(targetDir, file);
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const meta = {
    id: path.basename(file, '.md'),
    title: path.basename(file, '.md'),
    type: 'Document',
    status: 'active',
  };

  if (fmMatch) {
    for (const line of fmMatch[1].split(/\r?\n/)) {
      const kv = line.match(/^([a-zA-Z0-9_-]+):\s*(.+)$/);
      if (kv && ['id', 'title', 'type', 'status', 'owner'].includes(kv[1])) {
        meta[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
      }
    }
  }

  const edges = new Set();
  for (const m of content.matchAll(/\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g)) {
    const targetId = m[1].trim();
    if (targetId && targetId !== meta.id) edges.add(targetId);
  }

  return { ...meta, path: relPath, edges: [...edges] };
}

const nodes = collectMarkdownFiles(targetDir).map(parseNode);
const safeMermaidId = (id) => id.replace(/[^a-zA-Z0-9_]/g, '_');

const mermaidLines = ['flowchart LR'];
for (const n of nodes) {
  const mId = safeMermaidId(n.id);
  const label = `${n.title} (${n.type})`.replace(/"/g, "'");
  mermaidLines.push(`  ${mId}["${label}"]`);
}
for (const n of nodes) {
  const fromId = safeMermaidId(n.id);
  for (const target of n.edges) {
    const toId = safeMermaidId(target);
    mermaidLines.push(`  ${fromId} --> ${toId}`);
  }
}

console.log(
  JSON.stringify(
    {
      docsRoot: targetDir,
      nodeCount: nodes.length,
      nodes,
      mermaidDiagram: mermaidLines.join('\n'),
    },
    null,
    2
  )
);
