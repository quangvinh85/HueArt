import test from 'node:test';
import assert from 'node:assert/strict';
import { gmailComposeUrl, tryCopyText } from '../src/shop/orderActions.ts';

const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
const setClipboard = value => Object.defineProperty(navigator, 'clipboard', { configurable: true, value });

test.after(() => {
  if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
  else delete navigator.clipboard;
});

test('Gmail opens an HTTPS compose URL and preserves Vietnamese and special characters', () => {
  const body = 'Ảnh Huế & bản quyền\nGhi chú: A+B? #1 = 10 USD';
  const url = new URL(gmailComposeUrl('seller@example.com', 'Đặt ảnh — Nguyễn An', body));
  assert.equal(url.origin, 'https://mail.google.com');
  assert.equal(url.searchParams.get('view'), 'cm');
  assert.equal(url.searchParams.get('to'), 'seller@example.com');
  assert.equal(url.searchParams.get('su'), 'Đặt ảnh — Nguyễn An');
  assert.equal(url.searchParams.get('body'), body);
});

test('copy reports success only after the browser writes the exact order text', async () => {
  let copied = '';
  setClipboard({ writeText: async text => { copied = text; } });
  assert.equal(await tryCopyText('Đơn ảnh 10 USD'), true);
  assert.equal(copied, 'Đơn ảnh 10 USD');
});

test('missing clipboard support returns a manual-copy fallback without an error', async () => {
  setClipboard(undefined);
  assert.equal(await tryCopyText('Đơn ảnh'), false);
});

test('clipboard denied by iframe permissions returns a manual-copy fallback', async () => {
  setClipboard({ writeText: async () => { throw new DOMException('Blocked by permissions policy', 'NotAllowedError'); } });
  assert.equal(await tryCopyText('Đơn ảnh'), false);
});
