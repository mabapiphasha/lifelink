# LifeLink Infrastructure - KMS & CloudWatch

## Overview

These CloudFormation templates provision encryption (KMS) and monitoring (CloudWatch) for the LifeLink blood and organ donation matching platform.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     KMS CMK                              │
│              alias/lifelink-encryption-key               │
├─────────────────────────────────────────────────────────┤
│ Encrypts:                                               │
│  • DynamoDB tables (Donors, Requests, Matches,          │
│    DonationHistory, OrganRequests, OrganApplications)   │
│  • S3 bucket (lifelink-frontend-hosting)                │
│  • SNS topic (lifelink-notifications)                   │
│  • CloudWatch Log Groups (all 4 Lambda functions)       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  CloudWatch                              │
├─────────────────────────────────────────────────────────┤
│ Log Groups:                                             │
│  • /aws/lambda/LifeLink-MatchingEngine                  │
│  • /aws/lambda/LifeLink-Notifications                   │
│  • /aws/lambda/LifeLink-DonorCRUD                       │
│  • /aws/lambda/LifeLink-RequestMgmt                     │
│                                                         │
│ Alarms:                                                 │
│  • Lambda errors > 5 in 5 min (per function)            │
│  • Lambda duration > 10s (per function)                 │
│  • API Gateway 5XX > 10 in 5 min                        │
│  • DynamoDB throttled requests > 0                      │
│                                                         │
│ Dashboard: LifeLink-Operations                          │
│  • Lambda invocations & errors                          │
│  • API Gateway requests & latency                       │
│  • DynamoDB read/write capacity                         │
│  • SNS messages published                               │
└─────────────────────────────────────────────────────────┘
```

## Deployment

### Prerequisites
- AWS CLI configured with appropriate permissions
- An existing Lambda execution role name

### Step 1: Deploy KMS Stack
```bash
aws cloudformation deploy \
  --template-file infrastructure/kms.yml \
  --stack-name lifelink-kms \
  --region us-east-1 \
  --parameter-overrides \
    LambdaExecutionRoleName=LifeLink-Lambda-ExecutionRole \
  --capabilities CAPABILITY_NAMED_IAM
```

### Step 2: Get KMS Key ARN
```bash
export KMS_KEY_ARN=$(aws cloudformation describe-stacks \
  --stack-name lifelink-kms \
  --query "Stacks[0].Outputs[?OutputKey=='KMSKeyArn'].OutputValue" \
  --output text)
```

### Step 3: Deploy CloudWatch Stack
```bash
aws cloudformation deploy \
  --template-file infrastructure/cloudwatch.yml \
  --stack-name lifelink-cloudwatch \
  --region us-east-1 \
  --parameter-overrides \
    KMSKeyArn=$KMS_KEY_ARN \
    AlertEmail=your-email@example.com \
    APIGatewayName=lifelink-api
```

### Step 4: Enable S3 Bucket Encryption
```bash
aws s3api put-bucket-encryption \
  --bucket lifelink-frontend-hosting \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "aws:kms",
        "KMSMasterKeyID": "'$KMS_KEY_ARN'"
      }
    }]
  }'
```

## Confirm email subscription

After deploying the CloudWatch stack, check your email and confirm the SNS subscription to start receiving alarm notifications.

## Cleanup

```bash
aws cloudformation delete-stack --stack-name lifelink-cloudwatch
aws cloudformation delete-stack --stack-name lifelink-kms
```
Note: KMS key has a 14-day pending deletion window.
