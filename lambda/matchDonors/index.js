const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const client = new DynamoDBClient({ region: 'us-east-1' });
const dynamodb = DynamoDBDocumentClient.from(client);
const sns = new SNSClient({ region: 'us-east-1' });
const ses = new SESClient({ region: 'us-east-1' });

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { requestId, bloodType, hospitalId } = body;

    if (!requestId || !bloodType || !hospitalId) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Missing required fields: requestId, bloodType, hospitalId' })
      };
    }

    // Get hospital details to determine location
    const hospitalResult = await dynamodb.send(new GetCommand({
      TableName: 'Hospitals',
      Key: { hospitalId }
    }));

    if (!hospitalResult.Item) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Hospital not found' })
      };
    }

    const hospital = hospitalResult.Item;
    const hospitalLocation = hospital.location;
    const hospitalName = hospital.hospitalName;

    console.log(`Hospital: ${hospitalName}, Location: ${hospitalLocation}`);

    // Query donors by blood type and active status using GSI
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

    // Filter donors by location (match hospital location)
    eligibleDonors = eligibleDonors.filter(donor => {
      const donorLocation = donor.location || '';
      const isLocationMatch = donorLocation.toLowerCase() === hospitalLocation.toLowerCase();
      console.log(`Donor ${donor.fullName}: ${donorLocation} - Match: ${isLocationMatch}`);
      return isLocationMatch;
    });

    console.log(`After location filter: ${eligibleDonors.length} eligible donors in ${hospitalLocation}`);

    if (eligibleDonors.length === 0) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          message: `No eligible donors found with blood type ${bloodType} in ${hospitalLocation}`,
          matchedDonors: 0,
          donors: []
        })
      };
    }

    const APP_BASE_URL = 'https://d150bjmbzkzpih.cloudfront.net';

    // Send email notifications to all eligible donors
    const emailPromises = eligibleDonors.map(async (donor) => {
      // Direct link to the confirm/decline page for this specific request
      const confirmUrl = `${APP_BASE_URL}/confirm-donation/${requestId}`;

      const emailParams = {
        Source: 'tmmoroka@amazon.com', // Verified SES email
        Destination: {
          ToAddresses: [donor.email]
        },
        Message: {
          Subject: {
            Data: `🩸 Urgent: ${hospitalName} needs your blood — please respond`
          },
          Body: {
            Html: {
              Data: `
                <html>
                  <head>
                    <style>
                      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                      .header { background-color: #991b1b; color: white; padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0; }
                      .header h1 { margin: 0; font-size: 22px; }
                      .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                      .info-box { background-color: white; padding: 16px; border-left: 4px solid #dc2626; margin: 16px 0; border-radius: 0 6px 6px 0; }
                      .cta-section { text-align: center; background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 24px; margin: 20px 0; }
                      .btn-confirm { background-color: #16a34a; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 15px; margin: 6px; }
                      .btn-decline { background-color: #6b7280; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 15px; margin: 6px; }
                      .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="header">
                        <h1>🩸 Urgent Blood Donation Request</h1>
                        <p style="margin: 8px 0 0; opacity: 0.85; font-size: 14px;">A hospital needs your help — please confirm your availability</p>
                      </div>
                      <div class="content">
                        <p>Dear <strong>${donor.fullName}</strong>,</p>
                        <p>
                          <strong>${hospitalName}</strong> urgently needs blood type <strong>${bloodType}</strong>.
                          You've been matched as an eligible donor in your area.
                        </p>

                        <div class="info-box">
                          <strong>🏥 Hospital:</strong> ${hospitalName}<br>
                          <strong>📍 Location:</strong> ${hospitalLocation}<br>
                          <strong>🩸 Blood Type:</strong> ${bloodType}<br>
                          <strong>⏰ Urgency:</strong> CRITICAL — response needed within 2 hours<br>
                          ${hospital.contact ? `<strong>📞 Contact:</strong> ${hospital.contact}` : ''}
                        </div>

                        <div class="cta-section">
                          <p style="font-size: 16px; font-weight: bold; margin: 0 0 16px; color: #92400e;">
                            Can you come to donate today?
                          </p>
                          <a href="${confirmUrl}" class="btn-confirm">✅ Yes, I'm Coming</a>
                          <a href="${confirmUrl}" class="btn-decline">❌ Can't Make It</a>
                          <p style="font-size: 12px; color: #9ca3af; margin: 12px 0 0;">
                            Clicking either button takes you to the LifeLink app to confirm your response.
                          </p>
                        </div>

                        <p style="font-size: 14px;">
                          <strong>If you're coming, please note:</strong><br>
                          • Arrive well-rested and having eaten a meal<br>
                          • Bring a valid government-issued ID<br>
                          • The process takes about 30–45 minutes
                        </p>

                        <div class="footer">
                          <p>Thank you for being a LifeLink donor. Your generosity saves lives.</p>
                          <p>© 2026 LifeLink | Blood &amp; Organ Donation Platform</p>
                          <p>
                            <a href="${APP_BASE_URL}/profile" style="color: #9ca3af;">Your profile</a> ·
                            <a href="${APP_BASE_URL}/blood-requests" style="color: #9ca3af;">All requests</a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </body>
                </html>
              `
            },
            Text: {
              Data: `Dear ${donor.fullName},

URGENT: ${hospitalName} needs blood type ${bloodType} — please respond.

Hospital: ${hospitalName}
Location: ${hospitalLocation}
Blood Type: ${bloodType}
Urgency: CRITICAL — response needed within 2 hours
${hospital.contact ? `Contact: ${hospital.contact}` : ''}

Can you come to donate today?

👉 Respond here (confirm or decline): ${confirmUrl}

If you're coming:
- Arrive well-rested and having eaten
- Bring a valid government-issued ID
- The process takes about 30-45 minutes

Thank you for being a LifeLink donor.

© 2026 LifeLink
              `
            }
          }
        }
      };

      try {
        await ses.send(new SendEmailCommand(emailParams));
        console.log(`Email sent successfully to ${donor.email}`);
        return { email: donor.email, status: 'sent' };
      } catch (error) {
        console.error(`Failed to send email to ${donor.email}:`, error);
        return { email: donor.email, status: 'failed', error: error.message };
      }
    });

    const emailResults = await Promise.all(emailPromises);
    const successCount = emailResults.filter(r => r.status === 'sent').length;

    // Update blood request with matched donors count
    await dynamodb.send(new UpdateCommand({
      TableName: 'BloodRequests',
      Key: { requestId },
      UpdateExpression: 'SET donorsInvited = :count',
      ExpressionAttributeValues: {
        ':count': eligibleDonors.length
      }
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        message: `Matched ${eligibleDonors.length} donor(s) in ${hospitalLocation}. Sent ${successCount} email notification(s).`,
        matchedDonors: eligibleDonors.length,
        emailsSent: successCount,
        hospitalLocation,
        donors: eligibleDonors.map(d => ({
          donorId: d.donorId,
          fullName: d.fullName,
          email: d.email,
          location: d.location,
          bloodType: d.bloodType
        })),
        emailResults
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        message: 'Failed to match donors', 
        error: error.message 
      })
    };
  }
};
