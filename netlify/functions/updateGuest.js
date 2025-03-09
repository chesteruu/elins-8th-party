const faunadb = require('faunadb');
const q = faunadb.query;

const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET_KEY
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'PUT') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { id } = event.queryStringParameters;
  const data = JSON.parse(event.body);

  try {
    const result = await client.query(
      q.Update(
        q.Ref(q.Collection('guests'), id),
        { data }
      )
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({ id: result.ref.id, ...result.data })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}; 