import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

function listTrackedFiles() {
  const out = execSync('git ls-files', { encoding: 'utf8' });
  return out.split('\n').map(s => s.trim()).filter(Boolean);
}

function scanFileForEllipticalBorderRadius(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const hits = [];

  // CSS elliptical border-radius syntax uses a slash: border-radius: ... / ...;
  const re = /border-radius\s*:\s*[^;\n]*\/[^;\n]*;/g;

  let m;
  while ((m = re.exec(content)) !== null) {
    const start = Math.max(0, m.index - 80);
    const end = Math.min(content.length, m.index + m[0].length + 80);
    hits.push({ match: m[0], context: content.slice(start, end) });
  }

  return hits;
}

test('style guard: forbid elliptical border-radius syntax (slash form)', () => {
  const files = listTrackedFiles().filter(f =>
    f === 'styles.css' ||
    f === 'index.html' ||
    f.startsWith('src/') && f.endsWith('.js')
  );

  const violations = [];
  for (const f of files) {
    const hits = scanFileForEllipticalBorderRadius(f);
    for (const h of hits) {
      violations.push({ file: f, match: h.match, context: h.context });
    }
  }

  assert.equal(
    violations.length,
    0,
    'Found forbidden elliptical border-radius syntax (slash form):\n' +
      violations.map(v => `- ${v.file}: ${v.match}\n  …${v.context.replace(/\n/g, '\\n')}…`).join('\n')
  );
});
