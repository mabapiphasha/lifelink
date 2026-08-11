const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { donorId, location, phone, fullName } = body;

    if (!donorId) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'donorId is required' })
      };
    }

    // Check if donor exists
    const getResult = await dynamodb.send(new GetCommand({
      TableName: 'Donors',
      Key: { donorId }
    }));

    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Donor not found' })
      };
    }

    // Build update expression dynamically based on provided fields
    const updateParts = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    if (location) {
      updateParts.push('#location = :location');
      expressionAttributeNames['#location'] = 'location';
      expressionAttributeValues[':location'] = location;
    }

    if (phone) {
      updateParts.push('#phone = :phone');
      expressionAttributeNames['#phone'] = 'phone';
      expressionAttributeValues[':phone'] = phone;
    }

    if (fullName) {
      updateParts.push('#fullName = :fullName');
      expressionAttributeNames['#fullName'] = 'fullName';
      expressionAttributeValues[':fullName'] = fullName;
    }

    if (updateParts.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'No valid fields to update' })
      };
    }

    // Add updatedAt timestamp
    updateParts.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const updateExpression = 'SET ' + updateParts.join(', ');

    // Update donor profile
    const updateResult = await dynamodb.send(new UpdateCommand({
      TableName: 'Donors',
      Key: { donorId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        message: 'Profile updated successfully',
        donor: updateResult.Attributes
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        message: 'Failed to update profile', 
        error: error.message 
      })
    };
  }
};
