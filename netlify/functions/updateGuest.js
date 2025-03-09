const faunadb = require('faunadb');
const q = faunadb.query;

const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET_KEY,
  domain: 'db.fauna.com'
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
  const data = JSON.parse(event.body);

  try {
    const result = await client.query(
      q.Let(
        {
          guestRef: q.Ref(q.Collection('guests'), id),
          updatedGuest: q.Update(
            q.Var('guestRef'),
            { data }
          )
        },
        q.Var('updatedGuest')
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