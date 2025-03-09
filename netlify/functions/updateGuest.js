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
    console.log("id:", id)

    stringId = "424958963405029582"
    
    // Pass the string ID to the FQL query
    const result = await client.query(fql`
      let guest = guests.byId(${stringId})
      guest.updateData({
        message: ${data.message !== undefined ? data.message : null},
        confirmed: ${data.confirmed !== undefined ? data.confirmed : false},
        attending: ${data.attending !== undefined ? data.attending : null}
      })
    `);
    
    console.log("Update result:", JSON.stringify(result, null, 2));
    
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