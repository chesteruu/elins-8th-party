const faunadb = require('faunadb');
const q = faunadb.query;

const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET_KEY,
  domain: 'db.fauna.com',
  scheme: 'https',
  headers: {
    'X-Fauna-Version': '9'
  }
});

exports.handler = async (event) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  try {
    const result = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('guests'))),
        q.Lambda(
          'ref',
          q.Select(['data'], q.Get(q.Var('ref')))
        )
      )
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.data || [])
    };
  } catch (error) {
    console.error('Fauna Error:', {
      message: error.message,
      description: error.description,
      code: error.requestResult?.statusCode,
      headers: error.requestResult?.responseHeaders
    });

    return {
      statusCode: error.requestResult?.statusCode || 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        description: error.description,
        code: error.requestResult?.statusCode
      })
    };
  }
}; 