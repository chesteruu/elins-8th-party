const faunadb = require('faunadb');
const q = faunadb.query;

const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET_KEY,
  domain: 'db.fauna.com'
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  try {
    await client.query(
      q.Let(
        {
          docs: q.Documents(q.Collection('guests')),
          deleteAll: q.Map(
            q.Paginate(q.Var('docs'), { size: 100 }),
            q.Lambda('ref', q.Delete(q.Var('ref')))
          )
        },
        q.Var('deleteAll')
      )
    );
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
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