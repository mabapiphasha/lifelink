# Changelog

## [2026-08-11] - Location-Based Donor Matching System

### Added
- **Location-Based Matching**: Donors are now only matched with hospitals in their city
  - Prevents cross-city matching (e.g., Cape Town donors won't be matched with Nairobi hospitals)
  - matchDonors Lambda now filters by hospital location
  - Sends professional HTML email notifications to matched donors

- **Donor Profile Editing**: Donors can now update their profile after registration
  - New updateDonorProfile Lambda function
  - Edit profile UI in DonorProfile page
  - Update location (12 cities available)
  - Update phone number
  - Update full name
  - API endpoint: POST /default/updateDonorProfile

- **Documentation**: 
  - LOCATION-MATCHING.md - Complete guide to location-based matching
  - Test scenarios and troubleshooting guide

### Changed
- **matchDonors Lambda** (lambda/matchDonors/index.js)
  - Added location filtering logic
  - Enhanced email notifications with HTML templates
  - Improved logging for debugging

- **DonorProfile.tsx**
  - Added "Edit Profile" button and panel
  - Location dropdown with city options
  - Real-time API integration for profile updates
  - Success/error feedback messages

- **API Configuration** (src/config/api.ts)
  - Added updateDonorProfile endpoint

### Technical Details
- Lambda Functions Deployed:
  - matchDonors (updated)
  - updateDonorProfile (new)
- API Gateway route added: POST /default/updateDonorProfile
- Location filtering is case-insensitive
- Supports 12 cities: Cape Town, Johannesburg, Nairobi, Dublin, Lagos, Pretoria, Durban, Port Elizabeth, Bloemfontein, Mombasa, Kisumu, Cork

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
