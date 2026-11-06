import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').notNull(),
  checkoutKey: text('checkout_key').notNull(),
  payloadHash: text('payload_hash').notNull(),
  requesterHash: text('requester_hash').notNull(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerEmail: text('customer_email').notNull().default(''),
  customerAddress: text('customer_address').notNull().default(''),
  customerNote: text('customer_note').notNull().default(''),
  itemsJson: text('items_json').notNull(),
  subtotalCents: integer('subtotal_cents').notNull(),
  shippingCents: integer('shipping_cents'),
  hasPrint: integer('has_print').notNull().default(0),
  hasCopyright: integer('has_copyright').notNull().default(0),
  rightsAccepted: integer('rights_accepted').notNull().default(0),
  status: text('status').notNull().default('new'),
  paymentStatus: text('payment_status').notNull().default('unpaid'),
  adminNote: text('admin_note').notNull().default(''),
  historyJson: text('history_json').notNull(),
  version: integer('version').notNull().default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, table => [
  uniqueIndex('orders_number_unique').on(table.orderNumber),
  uniqueIndex('orders_checkout_unique').on(table.checkoutKey),
  index('orders_created_idx').on(table.createdAt),
  index('orders_status_idx').on(table.status),
  index('orders_requester_created_idx').on(table.requesterHash, table.createdAt),
]);

export const artworkSubmissions = sqliteTable('artwork_submissions', {
  id: text('id').primaryKey(), reference: text('reference').notNull(), submissionKey: text('submission_key').notNull(), payloadHash: text('payload_hash').notNull(), requesterHash: text('requester_hash').notNull(),
  title: text('title').notNull(), titleEn: text('title_en').notNull().default(''), titleFr: text('title_fr').notNull().default(''),
  authorName: text('author_name').notNull(), authorEmail: text('author_email').notNull().default(''), authorPhone: text('author_phone').notNull(),
  location: text('location').notNull().default(''), story: text('story').notNull().default(''), collection: text('collection').notNull(),
  objectKey: text('object_key').notNull(), contentType: text('content_type').notNull(), status: text('status').notNull().default('pending'), adminNote: text('admin_note').notNull().default(''), version: integer('version').notNull().default(1),
  createdAt: text('created_at').notNull(), updatedAt: text('updated_at').notNull(),
}, table => [uniqueIndex('artwork_submissions_reference').on(table.reference), uniqueIndex('artwork_submissions_key').on(table.submissionKey),index('artwork_submissions_requester').on(table.requesterHash,table.createdAt)]);

export const adminSessions = sqliteTable('admin_sessions', {
  tokenHash:text('token_hash').primaryKey(), userId:text('user_id').notNull(), passwordVersion:text('password_version').notNull(), createdAt:integer('created_at').notNull(), expiresAt:integer('expires_at').notNull(),
},table=>[index('admin_sessions_expiry').on(table.expiresAt)]);
export const adminLoginAttempts = sqliteTable('admin_login_attempts', {
  attemptKey:text('attempt_key').primaryKey(), failures:integer('failures').notNull().default(0), windowStarted:integer('window_started').notNull(),
});
