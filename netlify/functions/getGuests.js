const { Client, fql } = require('fauna');

const client = new Client({
  secret: process.env.FAUNA_SECRET_KEY,
});

exports.handler = async (event) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  try {
    // Using the correct query syntax for v10
    const result = await client.query(fql`
      guests.all().map(x => {
        {
          id: x.id,
          name: x.name,
          email: x.email,
          numberOfGuests: x.numberOfGuests,
          message: x.message,
          confirmed: x.confirmed,
          attending: x.attending
        }
      })
    `);

    console.log('Query result:', result); // Debug log

    // Extract the nested data array from the result
    const guestsArray = result.data && result.data.data ? result.data.data : [];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(guestsArray)
    };
  } catch (error) {
    // More detailed error logging
    console.error('Fauna Error Details:', {
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
        details: error.stack
      })
    };
  }
}; 