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
    
    // Only proceed if we have fields to update
    if (Object.keys(updateData).length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "No valid fields to update" })
      };
    }
    
    // Build the FQL query dynamically
    const result = await client.query(fql`
      guests.byId(${id})?.updateData({
          id: "${id}",
          coll: guests,
          message: "${data.message}",
          confirmed: ${data.confirmed},
          attending: ${data.attending}
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