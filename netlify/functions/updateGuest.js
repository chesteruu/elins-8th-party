const { Client, fql } = require('fauna');

const client = new Client({
  secret: process.env.FAUNA_SECRET_KEY,
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'PUT') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  const { id } = event.queryStringParameters;
  if (!id) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing required parameter: id" })
    };
  }

  try {
    const data = JSON.parse(event.body);
    console.log("Update data received:", data);
    
    // Create an update object with only the fields that are defined
    const updateData = {};
    
    // Only add fields that are defined and not null/undefined
    if (data.name !== undefined && data.name !== null) updateData.name = data.name;
    if (data.email !== undefined && data.email !== null) updateData.email = data.email;
    if (data.numberOfGuests !== undefined && data.numberOfGuests !== null) updateData.numberOfGuests = data.numberOfGuests;
    if (data.message !== undefined && data.message !== null) updateData.message = data.message;
    if (data.confirmed !== undefined && data.confirmed !== null) updateData.confirmed = data.confirmed;
    if (data.attending !== undefined) updateData.attending = data.attending; // Allow null for attending
    updateData.id = id;
    updateData.coll = 'guests'
    
    console.log("Sanitized update data:", updateData);
    
    // Only proceed if we have fields to update
    if (Object.keys(updateData).length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "No valid fields to update" })
      };
    }

    // Jsonfy the updateData
    const updateDataJson = JSON.stringify(updateData);
    console.log("Update data JSON:", updateDataJson);
    
    // Build the FQL query dynamically
    const result = await client.query(fql`
      guests.byId(${id})?.updateData({
        ${updateDataJson}
      })
    `);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        id: result.id,
        ...result.data
      })
    };
  } catch (error) {
    console.error('Fauna Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      raw: error
    });
    return {
      statusCode: error.status || 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        name: error.name,
        details: error.stack,
        raw: error
      })
    };
  }
}; 