const faunadb = require('faunadb');
const q = faunadb.query;

const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET_KEY
});

exports.handler = async (event) => {
  try {
    const { data } = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('guests'))),
        q.Lambda('ref', q.Get(q.Var('ref')))
      )
    );
    
    const guests = data.map(d => ({ id: d.ref.id, ...d.data }));
    
    return {
      statusCode: 200,
      body: JSON.stringify(guests)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}; 