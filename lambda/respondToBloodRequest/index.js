const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { randomUUID } = require('crypto');

const client = new DynamoDBClient({ region: 'us-east-1' });
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { requestId, donorId, donorEmail, response } = body;

    // Validate input
    if (!requestId || !donorId || !response) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing required fields: requestId, donorId, response' })
      };
    }

    if (!['confirmed', 'declined'].includes(response)) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Response must be "confirmed" or "declined"' })
      };
    }

    // Get the blood request to verify it exists
    const requestResult = await dynamodb.send(new GetCommand({
      TableName: 'BloodRequests',
      Key: { requestId }
    }));

    if (!requestResult.Item) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Blood request not found' })
      };
    }

    const bloodRequest = requestResult.Item;

    // Save the donor's response
    const responseId = randomUUID();
    await dynamodb.send(new PutCommand({
      TableName: 'BloodRequestResponses',
      Item: {
        responseId,
        requestId,
        donorId,
        donorEmail: donorEmail || '',
        response,
        respondedAt: new Date().toISOString(),
        hospitalId: bloodRequest.hospitalId,
        hospitalName: bloodRequest.hospitalName,
        bloodType: bloodRequest.bloodType,
        urgency: bloodRequest.urgency
      }
    }));

    console.log(`Donor ${donorId} ${response} blood request ${requestId}`);

    // Update the blood request's confirmed count if donor confirmed
    if (response === 'confirmed') {
      const currentConfirmed = bloodRequest.donorsConfirmed || 0;
      await dynamodb.send(new UpdateCommand({
        TableName: 'BloodRequests',
        Key: { requestId },
        UpdateExpression: 'SET donorsConfirmed = :confirmed',
        ExpressionAttributeValues: {
          ':confirmed': currentConfirmed + 1
        }
      }));

      console.log(`Updated blood request ${requestId}: donorsConfirmed = ${currentConfirmed + 1}`);
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        message: `Response recorded: ${response}`,
        responseId,
        hospitalName: bloodRequest.hospitalName,
        hospitalLocation: bloodRequest.location || 'N/A'
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to record response', details: error.message })
    };
  }
};
