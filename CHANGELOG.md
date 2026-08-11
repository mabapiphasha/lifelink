# Changelog

## [2026-08-11] - OTP System Fix & DynamoDB Update

### Fixed
- **OTP System**: Resolved issue where only tmmoroka@amazon.com could receive OTPs
  - Root cause: AWS SES is in sandbox mode (requires email verification)
  - Added all 12 donor emails to SES verified identities list
  - Each donor must click verification link in their email to complete setup
  - See `infrastructure/SES-SETUP.md` for details

### Added
- New donor code entry for Kethu Sabela (sabelak@amazon.com)
  - Code: LL-GS-2026-K9S1
  - Hospital: Groote Schuur Hospital
  - Blood Type: O+
  - Screening Date: 2026-08-11
  - Expires: 2026-08-25
  - Status: Unused

- SES configuration documentation (`infrastructure/SES-SETUP.md`)
  - How to verify new donor emails
  - How to request SES production access
  - Troubleshooting guide

### Action Required
- **All donors must verify their emails**: Check inbox for AWS SES verification email
- **Recommended**: Request AWS SES production access to remove verification requirement
