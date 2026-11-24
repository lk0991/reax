import test from 'node:test';
import assert from 'node:assert/strict';
import { page, esc } from '../lib/page.mjs';

test('the shell gives every published page a title, light and dark tokens, the safe-area gutter and no scripts', () => {
  const html = page({ title: 'Quality verdict', css: '.x { color: var(--ink); }', body: '<main>Hi</main>' });
  assert.match(html, /^<title>Quality verdict<\/title>/);
  assert.match(html, /<meta name="claude:viewport-fit-sides" content="cover">/);
  assert.match(html, /:root \{[^}]*--bg:[^}]*color-scheme: light/);
  assert.match(html, /@media \(prefers-color-scheme: dark\) \{ :root:not\(\[data-theme="light"\]\)/);
  assert.match(html, /:root\[data-theme="dark"\]/);
  assert.match(html, /padding-left: max\(16px, env\(safe-area-inset-left, 0px\)\)/);
  assert.match(html, /\.x \{ color: var\(--ink\); \}/);
  assert.match(html, /<main>Hi<\/main>/);
  assert.ok(!/<script|<html|<body|<head|<!doctype/i.test(html));
});

test('extra head lines (a font link) go after the metas, and the title is escaped', () => {
  const html = page({ title: 'A <b>', head: '<link rel="stylesheet" href="https://fonts.googleapis.com/x">', body: '' });
  assert.match(html, /^<title>A &lt;b&gt;<\/title>/);
  assert.match(html, /viewport-fit-sides" content="cover">\n<link rel="stylesheet"/);
});

test('esc escapes the characters HTML cares about', () => {
  assert.equal(esc('<a href="x">&\'</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;\'&lt;/a&gt;');
  assert.equal(esc(null), '');
});
