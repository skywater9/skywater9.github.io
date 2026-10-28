import test from 'node:test';
import assert from 'node:assert/strict';
import { createHeadingId, getActiveHeadingIndex } from '../src/scripts/page-outline.ts';

test('heading anchors remain unique alongside existing element IDs', () => {
  const ids = new Set(['testing', 'testing-2', 'sidebar']);
  assert.equal(createHeadingId('Testing', ids), 'testing-3');
  assert.equal(createHeadingId('Testing', ids), 'testing-4');
  assert.equal(createHeadingId('Sidebar', ids), 'sidebar-2');
});

test('headings support accents, non-Latin titles, and punctuation-only titles', () => {
  const ids = new Set();
  assert.equal(createHeadingId('Göksu — Design & Testing', ids), 'goksu-design-testing');
  assert.equal(createHeadingId('设计', ids), '设计');
  assert.equal(createHeadingId('!!!', ids), 'section');
  assert.equal(createHeadingId('?', ids), 'section-2');
});

test('scroll selection advances and reverses at the content pane activation line', () => {
  assert.equal(getActiveHeadingIndex([140, 440, 740], 172, false), 0);
  assert.equal(getActiveHeadingIndex([-160, 140, 440], 172, false), 1);
  assert.equal(getActiveHeadingIndex([-460, -160, 140], 172, false), 2);
  assert.equal(getActiveHeadingIndex([40, 340, 640], 172, false), 0);
});

test('the last section activates at the bottom even when it cannot reach the top', () => {
  assert.equal(getActiveHeadingIndex([-500, 80, 460], 172, true), 2);
});

test('empty pages have no active heading; short pages start at their first heading', () => {
  assert.equal(getActiveHeadingIndex([], 172, false), -1);
  assert.equal(getActiveHeadingIndex([], 172, true), -1);
  assert.equal(getActiveHeadingIndex([200, 280], 172, false), 0);
});
