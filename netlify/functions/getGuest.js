const faunadb = require('faunadb');
const q = faunadb.query;

const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET_KEY
});

exports.handler = async (event) => {
  const { id } = event.queryStringParameters;
  
  try {
    const guest = await client.query(
      q.Get(q.Ref(q.Collection('guests'), id))
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({ id: guest.ref.id, ...guest.data })
    };
  } catch (error) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Guest not found' })
    };
  }
}; 