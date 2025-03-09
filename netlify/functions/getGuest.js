const faunadb = require('faunadb');
const q = faunadb.query;

const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET_KEY,
  domain: 'db.fauna.com'
});

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  const { id } = event.queryStringParameters;
  
  try {
    const result = await client.query(
      q.Let(
        {
          guestRef: q.Ref(q.Collection('guests'), id),
          guest: q.Get(q.Var('guestRef'))
        },
        q.Var('guest')
      )
    );
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ id: result.ref.id, ...result.data })
    };
  } catch (error) {
    console.error('Fauna Error:', {
      message: error.message,
      description: error.description,
      code: error.requestResult?.statusCode
    });
    return {
      statusCode: error.requestResult?.statusCode || 404,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        description: error.description,
        code: error.requestResult?.statusCode
      })
    };
  }
}; 