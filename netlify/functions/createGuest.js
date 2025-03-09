const faunadb = require('faunadb');
const q = faunadb.query;

const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET_KEY
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const data = JSON.parse(event.body);

  try {
    const result = await client.query(
      q.Create(
        q.Collection('guests'),
        { 
          data: {
            name: data.name,
            email: data.email || null,
            numberOfGuests: data.numberOfGuests,
            message: data.message || '',
            confirmed: data.confirmed || false,
            attending: data.attending || null
          }
        }
      )
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({ id: result.ref.id, ...result.data })
    };
  } catch (error) {
    console.error('Fauna Error:', error);
    return {
      statusCode: error.requestResult?.statusCode || 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}; 