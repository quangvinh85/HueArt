import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const siteVisits = sqliteTable('site_visits', {
  sessionId: text('session_id').primaryKey(),
});

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
  paymentMethod: text('payment_method').notNull().default('contact'),
  exchangeRate: integer('exchange_rate').notNull().default(26000),
  bankSnapshotJson: text('bank_snapshot_json').notNull().default('{}'),
  paymentClaimedAt: text('payment_claimed_at'),
  paymentReference: text('payment_reference').notNull().default(''),
  reportedAmountVnd: integer('reported_amount_vnd').notNull().default(0),
  receivedAmountVnd: integer('received_amount_vnd').notNull().default(0),
  rightsConfirmed: integer('rights_confirmed').notNull().default(0),
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
  submissionOrigin:text('submission_origin').notNull().default('contributor'),
  revenueTermsJson:text('revenue_terms_json').notNull().default('{}'),
  pricingJson:text('pricing_json').notNull().default('{}'),
  adminPricingJson:text('admin_pricing_json').notNull().default('{}'),
  objectKey: text('object_key').notNull(), contentType: text('content_type').notNull(), status: text('status').notNull().default('pending'), adminNote: text('admin_note').notNull().default(''), version: integer('version').notNull().default(1),
  createdAt: text('created_at').notNull(), updatedAt: text('updated_at').notNull(),
}, table => [uniqueIndex('artwork_submissions_reference').on(table.reference), uniqueIndex('artwork_submissions_key').on(table.submissionKey),index('artwork_submissions_requester').on(table.requesterHash,table.createdAt)]);

export const adminSessions = sqliteTable('admin_sessions', {
  tokenHash:text('token_hash').primaryKey(), userId:text('user_id').notNull(), passwordVersion:text('password_version').notNull(), createdAt:integer('created_at').notNull(), expiresAt:integer('expires_at').notNull(),
},table=>[index('admin_sessions_expiry').on(table.expiresAt)]);
export const adminLoginAttempts = sqliteTable('admin_login_attempts', {
  attemptKey:text('attempt_key').primaryKey(), failures:integer('failures').notNull().default(0), windowStarted:integer('window_started').notNull(),
});

// Overrides keep the original catalogue and historical order snapshots intact.
export const catalogueOverrides = sqliteTable('catalogue_overrides', {
  artworkId: text('artwork_id').primaryKey(),
  metadataJson: text('metadata_json').notNull().default('{}'),
  hidden: integer('hidden').notNull().default(0),
  deletedAt: text('deleted_at'),
  version: integer('version').notNull().default(1),
  updatedAt: text('updated_at').notNull(),
});

export const shopSettings = sqliteTable('shop_settings', {
  key: text('key').primaryKey(),
  valueJson: text('value_json').notNull(),
  version: integer('version').notNull().default(1),
  updatedAt: text('updated_at').notNull(),
});

export const orderNotifications=sqliteTable('order_notifications',{
 orderId:text('order_id').primaryKey(),
 status:text('status').notNull().default('pending'),
 lastAttemptAt:text('last_attempt_at'),
 nextChunk:integer('next_chunk').notNull().default(0),
 attempts:integer('attempts').notNull().default(0),
 lastError:text('last_error').notNull().default(''),
 sentAt:text('sent_at'),
 createdAt:text('created_at').notNull(),
},table=>[index('order_notifications_created').on(table.createdAt)]);
