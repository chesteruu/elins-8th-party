const faunadb = require('faunadb');
const q = faunadb.query;

const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET_KEY
});

exports.handler = async (event) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  try {
    // First test if we can access the collection
    await client.query(
      q.Get(q.Collection('guests'))
    );

    // If that works, try to get all documents
    const { data } = await client.query(
      q.Map(
        q.Paginate(
          q.Documents(q.Collection('guests')),
          { size: 100 } // Limit to 100 documents for safety
        ),
        q.Lambda('ref', q.Get(q.Var('ref')))
      )
    );
    
    const guests = data.map(d => ({
      id: d.ref.id,
      ...d.data
    }));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(guests)
    };
  } catch (error) {
    console.error('Fauna Error:', {
      message: error.message,
      description: error.description,
      requestResult: error.requestResult,
      stack: error.stack
    });

    return {
      statusCode: error.requestResult?.statusCode || 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        description: error.description,
        code: error.requestResult?.statusCode,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
}; 