const faunadb = require('faunadb');
const q = faunadb.query;

const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET_KEY
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { id } = event.queryStringParameters;

  try {
    await client.query(
      q.Delete(q.Ref(q.Collection('guests'), id))
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, id })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}; 