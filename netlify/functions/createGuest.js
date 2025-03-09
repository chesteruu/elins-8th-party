const { Client, fql } = require('fauna');

const client = new Client({
  secret: process.env.FAUNA_SECRET_KEY,
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  const data = JSON.parse(event.body);

  try {
    const result = await client.query(fql`
      guests.create({
        data: {
          name: ${data.name},
          email: ${data.email || null},
          numberOfGuests: ${data.numberOfGuests},
          message: ${data.message || ''},
          confirmed: ${data.confirmed || false},
          attending: ${data.attending || null}
        }
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
      stack: error.stack
    });
    return {
      statusCode: error.status || 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        name: error.name,
        details: error.stack
      })
    };
  }
}; 