import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

function listTrackedFiles() {
  const out = execSync('git ls-files', { encoding: 'utf8' });
  return out.split('\n').map((s) => s.trim()).filter(Boolean);
}

test('visual motif guard: inline SVG usage requires explicit review/allowlist', () => {
  const tracked = listTrackedFiles();

  const filesToScan = tracked.filter((f) => {
    if (f.startsWith('tests/')) return false;
    if (f.startsWith('docs/')) return false;
    return f.endsWith('.js') || f.endsWith('.html') || f.endsWith('.css');
  });

  const svgTagRe = /<svg\b[^>]*>/gi;
  const pathWithDRe = /<path\b[^>]*\sd="[^"]*"[^>]*>/gi;

  const violations = [];

  for (const file of filesToScan) {
    const content = fs.readFileSync(file, 'utf8');

    let match;
    while ((match = svgTagRe.exec(content)) !== null) {
      const start = Math.max(0, match.index - 80);
      const end = Math.min(content.length, match.index + match[0].length + 80);
      violations.push({
        file,
        kind: 'svg-tag',
        snippet: content.slice(start, end),
      });
    }

    while ((match = pathWithDRe.exec(content)) !== null) {
      const start = Math.max(0, match.index - 80);
      const end = Math.min(content.length, match.index + match[0].length + 80);
      violations.push({
        file,
        kind: 'path-d-attribute',
        snippet: content.slice(start, end),
      });
    }
  }

  assert.equal(
    violations.length,
    0,
    'visual motif guard: inline SVG <svg> tags and <path d="..."> shapes are currently disallowed in app/game source. ' +
      'If you intentionally introduce SVG-based shapes, add a scoped guard test and explicit allowlist, then update this guard. ' +
      '\n\nOffending locations:\n' +
      violations
        .map((v) => `- ${v.file} [${v.kind}]\n  …${v.snippet.replace(/\n/g, '\\n')}…`)
        .join('\n'),
  );
});
