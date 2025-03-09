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
    const result = await client.query(fql`
      Collection.byName("guests").all().map(
        (doc) => {
          {
            id: doc.id,
            ...doc.data
          }
        }
      )
    `);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.data || [])
    };
  } catch (error) {
    console.error('Fauna Error:', {
      message: error.message,
      description: error.description,
      code: error.status
    });

    return {
      statusCode: error.status || 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        description: error.description,
        code: error.status
      })
    };
  }
}; 