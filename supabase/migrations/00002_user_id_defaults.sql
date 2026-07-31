-- Safety net: ensure user_id is always set from the authenticated user.
-- Run this after 00001_initial_schema.sql to make inserts robust even
-- when user_id is omitted from the client payload.

ALTER TABLE categories
  ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE transactions
  ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE budgets
  ALTER COLUMN user_id SET DEFAULT auth.uid();
