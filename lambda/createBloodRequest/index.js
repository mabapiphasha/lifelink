const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { randomUUID } = require('crypto');

const client = new DynamoDBClient({ region: 'us-east-1' });
const dynamodb = DynamoDBDocumentClient.from(client);
const ses = new SESClient({ region: 'us-east-1' });

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { hospitalId, hospitalName, bloodType, urgency, unitsNeeded } = body;

    if (!hospitalId || !bloodType || !urgency || !unitsNeeded) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const requestId = randomUUID();

    // Get hospital details to get location
    const hospitalResult = await dynamodb.send(new GetCommand({
      TableName: 'Hospitals',
      Key: { hospitalId }
    }));

    if (!hospitalResult.Item) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Hospital not found' })
      };
    }

    const hospital = hospitalResult.Item;
    const hospitalLocation = hospital.location;

    // Create blood request
    await dynamodb.send(new PutCommand({
      TableName: 'BloodRequests',
      Item: {
        requestId,
        hospitalId,
        hospitalName,
        bloodType,
        urgency,
        unitsNeeded: Number(unitsNeeded),
        status: 'open',
        donorsInvited: 0,
        donorsConfirmed: 0,
        createdAt: new Date().toISOString()
      }
    }));

    console.log(`Blood request created: ${requestId}`);

    // AUTOMATIC MATCHING: Query eligible donors by blood type and location
    const queryResult = await dynamodb.send(new QueryCommand({
      TableName: 'Donors',
      IndexName: 'bloodType-status-index',
      KeyConditionExpression: 'bloodType = :bloodType AND #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':bloodType': bloodType,
        ':status': 'active'
      }
    }));

    let eligibleDonors = queryResult.Items || [];
    console.log(`Found ${eligibleDonors.length} donors with blood type ${bloodType}`);

    // Filter by location
    eligibleDonors = eligibleDonors.filter(donor => {
      const donorLocation = donor.location || '';
      const isLocationMatch = donorLocation.toLowerCase() === hospitalLocation.toLowerCase();
      return isLocationMatch;
    });

    console.log(`After location filter: ${eligibleDonors.length} eligible donors in ${hospitalLocation}`);

    // Send email notifications to matched donors
    let emailsSentCount = 0;
    if (eligibleDonors.length > 0) {
      const emailPromises = eligibleDonors.map(async (donor) => {
        const emailParams = {
          Source: 'tmmoroka@amazon.com',
          Destination: {
            ToAddresses: [donor.email]
          },
          Message: {
            Subject: {
              Data: `🩸 Urgent: Your Blood is Needed at ${hospitalName}`
            },
            Body: {
              Html: {
                Data: `
                  <html>
                    <head>
                      <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .button { background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
                        .info-box { background-color: white; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                      </style>
                    </head>
                    <body>
                      <div class="container">
                        <div class="header">
                          <h1>🩸 Blood Donation Request</h1>
                        </div>
                        <div class="content">
                          <p>Dear ${donor.fullName},</p>
                          <p>We need your help! <strong>${hospitalName}</strong> has an urgent need for your blood type.</p>
                          
                          <div class="info-box">
                            <strong>📍 Hospital:</strong> ${hospitalName}<br>
                            <strong>📍 Location:</strong> ${hospitalLocation}<br>
                            <strong>🩸 Blood Type Needed:</strong> ${bloodType}<br>
                            <strong>⏰ Urgency:</strong> ${urgency}<br>
                            <strong>💉 Units Needed:</strong> ${unitsNeeded}
                          </div>

                          <p><strong>You are a perfect match!</strong> Your contribution can save lives.</p>
                          
                          <p>Please visit the hospital as soon as possible if you are able to donate.</p>
                          
                          <div style="text-align: center;">
                            <a href="http://d150bjmbzkzpih.cloudfront.net/" class="button">View Details on LifeLink</a>
                          </div>

                          <p style="margin-top: 30px; font-size: 14px;">
                            <strong>Important Notes:</strong><br>
                            • Ensure you are well-rested and have eaten before donating<br>
                            • Bring a valid ID<br>
                            • Contact the hospital if you have questions: ${hospital.contact || 'N/A'}
                          </p>

                          <div class="footer">
                            <p>Thank you for being a LifeLink donor. Your generosity saves lives.</p>
                            <p>© 2026 LifeLink | Blood & Organ Donation Platform</p>
                          </div>
                        </div>
                      </div>
                    </body>
                  </html>
                `
              },
              Text: {
                Data: `
Dear ${donor.fullName},

URGENT: Blood Donation Request

${hospitalName} urgently needs blood type ${bloodType}.

Hospital: ${hospitalName}
Location: ${hospitalLocation}
Blood Type Needed: ${bloodType}
Urgency: ${urgency}
Units Needed: ${unitsNeeded}

You are a perfect match! Please visit the hospital as soon as possible if you are able to donate.

Visit LifeLink: http://d150bjmbzkzpih.cloudfront.net/

Important Notes:
- Ensure you are well-rested and have eaten before donating
- Bring a valid ID
- Contact: ${hospital.contact || 'N/A'}

Thank you for being a LifeLink donor. Your generosity saves lives.

© 2026 LifeLink
                `
              }
            }
          }
        };

        try {
          await ses.send(new SendEmailCommand(emailParams));
          console.log(`✅ Email sent successfully to ${donor.email}`);
          return { email: donor.email, status: 'sent' };
        } catch (error) {
          console.error(`❌ Failed to send email to ${donor.email}:`, error.message);
          // If SES sandbox mode, log specific message
          if (error.message && error.message.includes('not verified')) {
            console.error(`   Note: SES is in sandbox mode. Email ${donor.email} is not verified.`);
          }
          return { email: donor.email, status: 'failed', error: error.message };
        }
      });

      const emailResults = await Promise.all(emailPromises);
      emailsSentCount = emailResults.filter(r => r.status === 'sent').length;
      
      console.log(`Email summary: ${emailsSentCount} sent, ${emailResults.length - emailsSentCount} failed out of ${eligibleDonors.length} donors`);

      // Update blood request with donors invited count
      await dynamodb.send(new PutCommand({
        TableName: 'BloodRequests',
        Item: {
          requestId,
          hospitalId,
          hospitalName,
          bloodType,
          urgency,
          unitsNeeded: Number(unitsNeeded),
          status: 'open',
          donorsInvited: eligibleDonors.length,
          donorsConfirmed: 0,
          createdAt: new Date().toISOString()
        }
      }));

      console.log(`Blood request updated: ${eligibleDonors.length} donors invited, ${emailsSentCount} emails sent successfully`);
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        requestId,
        message: `Blood request created successfully. Found ${eligibleDonors.length} matching donor(s).`,
        donorsMatched: eligibleDonors.length,
        emailsSent: emailsSentCount
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to create blood request', details: error.message })
    };
  }
};
