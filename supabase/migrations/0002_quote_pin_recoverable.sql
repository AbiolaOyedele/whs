-- ============================================================================
-- Make a quote's access code recoverable by the operator.
--
-- WHY THIS IS AN ACCEPTABLE CHANGE, stated plainly so nobody has to guess later.
--
-- Until now the PIN was stored only as a salted SHA-256 digest, the way a
-- password is. That was the wrong model for this particular secret.
--
-- Hashing a password is valuable because the password protects things the
-- attacker does NOT already have — other accounts, other sites, the user's
-- identity. A quote PIN protects exactly one document, and that document lives
-- in the same table, three columns away. Anyone who can read `pin_hash` can
-- already read `project_summary` and every line item it was guarding. Hashing
-- bought almost nothing against the threat it looked like it was addressing,
-- while costing a real operational problem: the only way to answer "what code
-- did we send this client?" was to issue a new one and lock them out.
--
-- So the PIN is now also stored ENCRYPTED, not plaintext:
--
--   * AES-256-GCM, key derived from QUOTE_PIN_PEPPER, which lives in the
--     environment and never in the database. A database dump on its own does
--     not yield PINs.
--   * `pin_hash` is unchanged and is still what verification uses — the
--     constant-time comparison path stays exactly as it was and as tested.
--     Decryption is only ever used to show the operator a code they own.
--   * Rotating QUOTE_PIN_PEPPER still invalidates everything, as before.
--
-- Existing rows keep working: `pin_encrypted` is nullable, and a quote created
-- before this migration simply cannot be revealed until its code is reissued.
-- ============================================================================

alter table wildhands.quotes
  add column if not exists pin_encrypted text
    check (pin_encrypted is null or char_length(pin_encrypted) <= 512);

comment on column wildhands.quotes.pin_encrypted is
  'AES-256-GCM ciphertext of the access code, keyed from QUOTE_PIN_PEPPER. Null for quotes created before this column existed. Never used for verification — pin_hash is.';
