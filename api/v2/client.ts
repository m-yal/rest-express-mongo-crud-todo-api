const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://max:1T2O3D4O5@cluster0.1p03jj1.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


client.connect((err: Error) => {
  if (err) return console.log(err);
});

export default client;