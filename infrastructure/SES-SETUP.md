# AWS SES Configuration for LifeLink OTP System

## Current Status
- **SES Mode**: Sandbox (Development)
- **Production Access**: Not Enabled
- **Region**: us-east-1

## Issue
AWS SES is currently in **sandbox mode**, which means:
- Emails can ONLY be sent to verified email addresses
- You cannot send emails to any random email address
- Daily sending quota: 200 emails/day
- Sending rate: 1 email/second

## Current Verified Emails (as of 2026-08-11)
The following email addresses are verified and can receive OTPs:

1. tmmoroka@amazon.com ✅
2. fkamau@amazon.com ✅
3. sabelak@amazon.com (verification pending)
4. diadamso@amazon.com (verification pending)
5. bongani.zulu@gmail.com (verification pending)
6. testdonor@gmail.com (verification pending)
7. naledi.khumalo@gmail.com (verification pending)
8. sipho.nkosi@gmail.com (verification pending)
9. amahle.dlamini@gmail.com (verification pending)
10. wanjiru.kamau@gmail.com (verification pending)
11. thabo.sithole@gmail.com (verification pending)
12. otieno.odhiambo@gmail.com (verification pending)
13. fatima.petersen@gmail.com (verification pending)

## Action Required
**Each donor must check their email inbox and click the verification link sent by AWS SES.**

## How to Add New Donor Emails

### Option 1: AWS CLI (Quick)
```bash
aws ses verify-email-identity --email-address new-donor@example.com --region us-east-1
```

Then ask the donor to check their email and click the verification link.

### Option 2: AWS Console
1. Go to [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Navigate to "Verified identities"
3. Click "Create identity"
4. Select "Email address"
5. Enter the donor's email
6. Click "Create identity"
7. Donor receives verification email and must click the link

## Long-Term Solution: Move SES to Production Mode

### Why?
- Send emails to ANY email address without pre-verification
- Higher sending limits (50,000 emails/day by default)
- No manual verification needed for each donor

### How to Request Production Access?

#### Step 1: Open SES Console
Go to https://console.aws.amazon.com/ses/

#### Step 2: Request Production Access
1. In the left sidebar, click on "Account dashboard"
2. Click "Request production access" button
3. Fill out the form:

**Use Case Details:**
- **Mail type**: Transactional
- **Website URL**: http://d150bjmbzkzpih.cloudfront.net/
- **Use case description**: 
  ```
  LifeLink is a blood and organ donation platform that connects donors 
  with hospitals. We use AWS SES to send One-Time Passwords (OTPs) for 
  donor authentication and verification during the registration process. 
  
  OTP emails are:
  - Transactional (not marketing)
  - Sent only when donors request them
  - Critical for donor identity verification
  - Expected to be delivered within seconds
  
  We expect to send approximately 50-100 OTP emails per day.
  ```

- **Acknowledgement**: Check all boxes confirming compliance with AWS policies

#### Step 3: Wait for Approval
- AWS typically responds within 24-48 hours
- You may receive follow-up questions
- Once approved, SES will automatically work for all email addresses

## Monitoring

### Check SES Sending Statistics
```bash
aws ses get-send-statistics --region us-east-1
```

### Check Account Status
```bash
aws sesv2 get-account --region us-east-1
```

Look for `"ProductionAccessEnabled": true` to confirm production mode.

## Troubleshooting

### Donors Not Receiving Verification Emails
1. Check spam/junk folder
2. Verify email address is correctly spelled
3. Check SES console for bounce/complaint reports

### OTP Emails Not Sending
1. Check if email is verified: `aws ses list-identities --region us-east-1`
2. Check Lambda logs: `aws logs tail /aws/lambda/sendOtp --follow`
3. Verify SES sending quota hasn't been exceeded

## Current Lambda Functions Using SES
- `sendOtp` - Sends OTP emails to donors during registration/login

## Related Resources
- [AWS SES Sandbox Documentation](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)
- [AWS SES Pricing](https://aws.amazon.com/ses/pricing/)
