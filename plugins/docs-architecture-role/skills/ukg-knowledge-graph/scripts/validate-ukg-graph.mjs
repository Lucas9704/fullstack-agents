#!/usr/bin/env node
/**
 * Zero-dependency UKG (Unified Knowledge Graph) Documentation Validator.
 * Usage: node validate-ukg-graph.mjs [docs-dir-path]
 *
 * Scans a Markdown documentation directory and validates:
 * 1. Required YAML frontmatter keys (id, title, type, status).
 * 2. Duplicate node IDs across the graph.
 * 3. Broken [[wikilinks]] and broken relative Markdown links [label](./path.md).
 * 4. Orphan nodes (files not linked from index.md or any other node).
 * 5. Skipped Markdown heading levels (e.g. # jumping directly to ###).
 */

import fs from 'node:fs';
import path from 'node:path';

const targetDir = path.resolve(process.argv[2] || path.join(process.cwd(), 'docs'));

if (!fs.existsSync(targetDir)) {
  console.error(JSON.stringify({ error: `Target directory does not exist: ${targetDir}` }, null, 2));
  process.exit(1);
}

const IGNORED_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build']);
const VALID_TYPES = new Set(['Hub', 'Concept', 'Service', 'Component', 'Schema', 'ADR', 'Runbook']);
const VALID_STATUSES = new Set(['draft', 'proposed', 'active', 'deprecated', 'superseded']);

function collectMarkdownFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir)) {
    if (IGNORED_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      collectMarkdownFiles(full, results);
    } else if (stat.isFile() && full.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return null;
  const raw = match[1];
  const meta = {};
  let currentArrayKey = null;

  for (const line of raw.split(/\r?\n/)) {
    if (/^\s*#/.test(line) || !line.trim()) continue;
    const arrayItem = line.match(/^\s*-\s+(.+)$/);
    if (arrayItem && currentArrayKey) {
      meta[currentArrayKey].push(arrayItem[1].trim().replace(/^["']|["']$/g, ''));
      continue;
    }
    const kv = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (kv) {
      const key = kv[1];
      const val = kv[2].trim();
      if (!val) {
        meta[key] = [];
        currentArrayKey = key;
      } else if (val.startsWith('[') && val.endsWith(']')) {
        meta[key] = val
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
        currentArrayKey = null;
      } else {
        meta[key] = val.replace(/^["']|["']$/g, '');
        currentArrayKey = null;
      }
    }
  }
  return { meta, body: content.slice(match[0].length) };
}

const files = collectMarkdownFiles(targetDir);
const nodesByFile = new Map();
const nodesById = new Map();
const findings = [];

// Pass 1: Parse frontmatter and register node IDs
for (const file of files) {
  const relFile = path.relative(targetDir, file);
  const content = fs.readFileSync(file, 'utf8');
  const parsed = parseFrontmatter(content);

  if (!parsed) {
    findings.push({
      file: relFile,
      ruleId: 'UKG_MISSING_FRONTMATTER',
      severity: 'HIGH',
      description: 'Markdown file is missing a YAML frontmatter block (---).',
    });
    // Keep the node in the graph so its links are still checked and links to it still resolve.
    const fallbackNode = { file, relFile, id: path.basename(file, '.md'), meta: {}, body: content, content };
    nodesByFile.set(file, fallbackNode);
    if (!nodesById.has(fallbackNode.id)) nodesById.set(fallbackNode.id, fallbackNode);
    continue;
  }

  const { meta, body } = parsed;
  for (const reqKey of ['id', 'title', 'type', 'status']) {
    if (!meta[reqKey]) {
      findings.push({
        file: relFile,
        ruleId: 'UKG_MISSING_REQUIRED_FIELD',
        severity: 'HIGH',
        description: `Missing required YAML frontmatter field: "${reqKey}".`,
      });
    }
  }

  if (meta.type && !VALID_TYPES.has(meta.type)) {
    findings.push({
      file: relFile,
      ruleId: 'UKG_UNKNOWN_NODE_TYPE',
      severity: 'MEDIUM',
      description: `Node type "${meta.type}" is not in standard set (${[...VALID_TYPES].join(', ')}).`,
    });
  }

  if (meta.status && !VALID_STATUSES.has(meta.status)) {
    findings.push({
      file: relFile,
      ruleId: 'UKG_UNKNOWN_STATUS',
      severity: 'MEDIUM',
      description: `Node status "${meta.status}" is not in standard set (${[...VALID_STATUSES].join(', ')}).`,
    });
  }

  const nodeId = meta.id || path.basename(file, '.md');
  if (nodesById.has(nodeId)) {
    findings.push({
      file: relFile,
      ruleId: 'UKG_DUPLICATE_NODE_ID',
      severity: 'HIGH',
      description: `Duplicate node id "${nodeId}" already declared in ${nodesById.get(nodeId).relFile}.`,
    });
  }

  const node = { file, relFile, id: nodeId, meta, body, content };
  nodesByFile.set(file, node);
  nodesById.set(nodeId, node);
}

// Pass 2: Validate edges (wikilinks & relative links), heading hierarchy, and track inbound references
const inboundCount = new Map(files.map((f) => [f, 0]));

for (const node of nodesByFile.values()) {
  const { file, relFile, content, body } = node;

  // Check wikilinks [[target-id]]
  const wikiMatches = [...content.matchAll(/\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g)];
  for (const m of wikiMatches) {
    const targetId = m[1].trim();
    const targetNode = nodesById.get(targetId);
    if (!targetNode) {
      findings.push({
        file: relFile,
        ruleId: 'UKG_BROKEN_WIKILINK',
        severity: 'HIGH',
        description: `Wikilink [[${targetId}]] does not match any node "id" in the graph.`,
      });
    } else if (targetNode.file !== file) {
      inboundCount.set(targetNode.file, (inboundCount.get(targetNode.file) || 0) + 1);
    }
  }

  // Check relative markdown links [label](./path.md)
  const mdLinkMatches = [...body.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)];
  for (const m of mdLinkMatches) {
    const rawHref = m[1].trim().split('#')[0];
    if (!rawHref || /^(https?:|mailto:|file:|#)/.test(rawHref)) continue;
    const resolved = path.resolve(path.dirname(file), rawHref);
    if (!fs.existsSync(resolved)) {
      findings.push({
        file: relFile,
        ruleId: 'UKG_BROKEN_RELATIVE_LINK',
        severity: 'HIGH',
        description: `Relative link (${rawHref}) points to a file that does not exist.`,
      });
    } else if (inboundCount.has(resolved) && resolved !== file) {
      inboundCount.set(resolved, (inboundCount.get(resolved) || 0) + 1);
    }
  }

  // Check heading level jumps outside code fences
  let inFence = false;
  let lastLevel = 0;
  for (const line of body.split(/\r?\n/)) {
    if (/^```/.test(line.trim())) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const hMatch = line.match(/^(#{1,6})\s+/);
    if (hMatch) {
      const level = hMatch[1].length;
      if (lastLevel > 0 && level > lastLevel + 1) {
        findings.push({
          file: relFile,
          ruleId: 'UKG_SKIPPED_HEADING_LEVEL',
          severity: 'MEDIUM',
          description: `Heading jumped from H${lastLevel} directly to H${level}: "${line.trim()}".`,
        });
      }
      lastLevel = level;
    }
  }
}

// Pass 3: Detect orphan nodes (excluding root index.md)
for (const [file, count] of inboundCount.entries()) {
  const node = nodesByFile.get(file);
  const isRootIndex = path.basename(file).toLowerCase() === 'index.md' && path.dirname(file) === targetDir;
  if (!isRootIndex && count === 0 && files.length > 1) {
    findings.push({
      file: node.relFile,
      ruleId: 'UKG_ORPHAN_NODE',
      severity: 'MEDIUM',
      description: `Orphan node "${node.id}" (${node.relFile}) has 0 inbound links from index.md or peer nodes.`,
    });
  }
}

const report = {
  docsRoot: targetDir,
  totalNodes: files.length,
  totalFindings: findings.length,
  bySeverity: {
    HIGH: findings.filter((f) => f.severity === 'HIGH').length,
    MEDIUM: findings.filter((f) => f.severity === 'MEDIUM').length,
  },
  findings,
};

console.log(JSON.stringify(report, null, 2));
process.exit(findings.some((f) => f.severity === 'HIGH') ? 1 : 0);
