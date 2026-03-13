import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Repository hygiene', () => {
  it('does not include package-lock.json (repo uses package.json only)', () => {
    const p = path.resolve(process.cwd(), 'package-lock.json');
    assert.strictEqual(fs.existsSync(p), false, 'package-lock.json should not be present in repo');
  });
});
