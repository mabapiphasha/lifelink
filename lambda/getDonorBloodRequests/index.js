const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // Get donor info from query parameters
    const params = event.queryStringParameters || {};
    const { donorId, bloodType, location } = params;

    if (!donorId || !bloodType || !location) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing required parameters: donorId, bloodType, location' })
      };
    }

    // Get all open blood requests
    const scanResult = await dynamodb.send(new ScanCommand({
      TableName: 'BloodRequests',
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'open'
      }
    }));

    let matchingRequests = scanResult.Items || [];

    // Filter by blood type and location
    matchingRequests = matchingRequests.filter(req => {
      const bloodTypeMatch = req.bloodType === bloodType;
      const locationMatch = (req.location || '').toLowerCase() === location.toLowerCase();
      return bloodTypeMatch && locationMatch;
    });

    console.log(`Found ${matchingRequests.length} matching blood requests for donor ${donorId}`);

    // Get donor's previous responses
    const responsesResult = await dynamodb.send(new ScanCommand({
      TableName: 'BloodRequestResponses',
      FilterExpression: 'donorId = :donorId',
      ExpressionAttributeValues: {
        ':donorId': donorId
      }
    }));

    const donorResponses = responsesResult.Items || [];
    const responseMap = {};
    donorResponses.forEach(r => {
      responseMap[r.requestId] = r.response;
    });

    // Add response status to each request
    const requestsWithStatus = matchingRequests.map(req => ({
      ...req,
      donorResponse: responseMap[req.requestId] || 'pending'
    }));

    // Sort by urgency and date
    const urgencyOrder = { 'Critical': 0, 'High': 1, 'Standard': 2 };
    requestsWithStatus.sort((a, b) => {
      const urgencyCompare = (urgencyOrder[a.urgency] || 2) - (urgencyOrder[b.urgency] || 2);
      if (urgencyCompare !== 0) return urgencyCompare;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        requests: requestsWithStatus,
        count: requestsWithStatus.length
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to fetch blood requests', details: error.message })
    };
  }
};
