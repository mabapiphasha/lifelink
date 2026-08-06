#!/bin/bash
# =============================================================
# LifeLink - Enable KMS encryption on existing DynamoDB tables
# Run this AFTER deploying the kms.yml CloudFormation stack
# =============================================================

set -e

# Get the KMS Key ARN from the CloudFormation stack output
KMS_KEY_ARN=$(aws cloudformation describe-stacks \
  --stack-name lifelink-kms \
  --query "Stacks[0].Outputs[?OutputKey=='KMSKeyArn'].OutputValue" \
  --output text)

if [ -z "$KMS_KEY_ARN" ]; then
  echo "❌ Could not find KMS Key ARN. Make sure lifelink-kms stack is deployed."
  exit 1
fi

echo "🔑 Using KMS Key: $KMS_KEY_ARN"
echo ""

TABLES=("Donors" "Requests" "Matches" "DonationHistory" "OrganRequests" "OrganApplications")

for TABLE in "${TABLES[@]}"; do
  echo "🔒 Encrypting table: $TABLE"
  aws dynamodb update-table \
    --table-name "$TABLE" \
    --sse-specification Enabled=true,SSEType=KMS,KMSMasterKeyId="$KMS_KEY_ARN" \
    --query "TableDescription.TableName" \
    --output text
  echo "   ✅ Done"
  # Wait a moment between updates to avoid throttling
  sleep 2
done

echo ""
echo "✅ All tables encrypted with KMS key: $KMS_KEY_ARN"
echo ""
echo "To verify:"
echo "  aws dynamodb describe-table --table-name Donors --query 'Table.SSEDescription'"
