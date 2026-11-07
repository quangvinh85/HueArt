import test from 'node:test';
import assert from 'node:assert/strict';
import { SALE_OPTIONS, addItem, cartTotal, itemTotal, orderText, restoreCart } from '../src/shop/catalog.ts';

const artworks = [{ id: 'hue', titles: { vi: 'Ảnh Huế' } }, { id: 'river', titles: { vi: 'Sông Hương' } }];
const customer = { name: 'Nguyễn An', email: 'an@example.com', phone: '0901234567', address: 'Huế', note: 'Giao buổi sáng' };

test('the three options have the requested fixed USD prices', () => {
  assert.deepEqual(SALE_OPTIONS.map(option => [option.id, option.priceUSD]), [['copyright', 10], ['high-resolution', 5], ['framed-print', 7]]);
});

test('cart totals distinguish each purchase type and multiply only print quantities', () => {
  let cart = addItem([], { artworkId: 'hue', optionId: 'copyright', quantity: 1 });
  cart = addItem(cart, { artworkId: 'hue', optionId: 'high-resolution', quantity: 1 });
  cart = addItem(cart, { artworkId: 'river', optionId: 'framed-print', quantity: 2 });
  assert.equal(cart.length, 3);
  assert.equal(cartTotal(cart), 29);
  assert.equal(itemTotal(cart[2]), 14);
});

test('repeat digital additions stay at one, print additions merge and are bounded', () => {
  const digital = { artworkId: 'hue', optionId: 'copyright', quantity: 1 };
  assert.equal(addItem([digital], digital)[0].quantity, 1);
  const print = { artworkId: 'hue', optionId: 'framed-print', quantity: 2 };
  assert.equal(addItem([print], print)[0].quantity, 4);
  assert.equal(addItem([print], { ...print, quantity: 150 })[0].quantity, 99);
});

test('restoring a cart rejects corrupt or stale entries and ignores stored prices', () => {
  const saved = JSON.stringify([
    { artworkId: 'hue', optionId: 'copyright', quantity: 9, unitPriceUSD: 0 },
    { artworkId: 'hue', optionId: 'copyright', quantity: 1 },
    { artworkId: 'river', optionId: 'framed-print', quantity: 2 },
    { artworkId: 'unknown', optionId: 'copyright', quantity: 1 },
    { artworkId: 'hue', optionId: 'old-frame', quantity: 1 },
    { artworkId: 'hue', optionId: 'high-resolution', quantity: -1 },
    { artworkId: 'hue', optionId: 'high-resolution', quantity: 1.5 }, null,
  ]);
  const restored = restoreCart(saved, artworks);
  assert.equal(restored.length, 2);
  assert.equal(restored[0].quantity, 1);
  assert.equal(cartTotal(restored), 24);
  for (const invalid of ['{', '{}', 'null', null]) assert.deepEqual(restoreCart(invalid, artworks), []);
});

test('digital order has no shipping address and does not claim payment or rights transfer', () => {
  const text = orderText([{ artworkId: 'hue', optionId: 'high-resolution', quantity: 1 }], customer, artworks);
  assert.match(text, /Tiền ảnh: 5 USD/);
  assert.match(text, /Nhận file qua email, không có phí vận chuyển/);
  assert.doesNotMatch(text, /Địa chỉ nhận bản in:/);
  assert.doesNotMatch(text, /Tôi yêu cầu chuyển toàn bộ quyền tác giả/);
  assert.match(text, /chưa xác nhận thanh toán/);
});

test('mixed order includes framed print shipping terms and written copyright agreement', () => {
  const text = orderText([
    { artworkId: 'hue', optionId: 'copyright', quantity: 1 },
    { artworkId: 'river', optionId: 'framed-print', quantity: 3 },
  ], customer, artworks);
  assert.match(text, /Tiền ảnh: 31 USD/);
  assert.match(text, /Địa chỉ nhận bản in: Huế/);
  assert.match(text, /40 × 60 cm đã gồm khung/);
  assert.match(text, /Phí vận chuyển chưa bao gồm/);
  assert.match(text, /thỏa thuận bằng văn bản trước khi thanh toán/);
});

test('published-artwork carts survive reload while the live catalogue loads',()=>{
  const item={artworkId:'submission-11111111-2222-4333-8444-555555555555',optionId:'high-resolution',quantity:1};
  assert.deepEqual(restoreCart(JSON.stringify([item]),artworks,true),[item]);
  assert.deepEqual(restoreCart(JSON.stringify([item]),artworks),[]);
  assert.deepEqual(restoreCart(JSON.stringify([{...item,artworkId:'submission-malformed'}]),artworks,true),[]);
});

test('cart totals and order text use approved per-artwork prices and keep default prices for legacy photos',()=>{
 const priced=[...artworks,{id:'custom',titles:{vi:'Ảnh giá riêng'},pricesCents:{copyright:2234,'high-resolution':1234,'framed-print':899}}];
 const items=[{artworkId:'custom',optionId:'copyright',quantity:1},{artworkId:'custom',optionId:'high-resolution',quantity:1},{artworkId:'custom',optionId:'framed-print',quantity:3}];
 assert.equal(itemTotal(items[2],priced),26.97);assert.equal(cartTotal(items,priced),61.65);
 assert.match(orderText(items,customer,priced),/61\.65 USD/);
 assert.equal(cartTotal([...items,{artworkId:'hue',optionId:'high-resolution',quantity:1}],priced),66.65);
});
