const { Client, fql } = require('fauna');

const client = new Client({
  secret: process.env.FAUNA_SECRET_KEY,
});

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  const { id } = event.queryStringParameters;
  
  try {
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required parameter: id" })
      };
    }
    
    console.log("Looking up guest with ID:", id);
    
    const result = await client.query(fql`
      guests.byId(${id})
    `);
    
    console.log("Query result:", result);
    
    if (!result) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "Guest not found" })
      };
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Fauna Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    return {
      statusCode: error.status || 404,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        name: error.name,
        details: error.stack
      })
    };
  }
}; 