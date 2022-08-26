const { MongoClient, ServerApiVersion } = require('mongodb');

const dbLogin = "max";
const dbPass = "1T2O3D4O5";
const uri = `mongodb+srv://${dbLogin}:${dbPass}@cluster0.1p03jj1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const dbName: string = "todo";

client.connect((err: Error) => {
  if (err) return console.log(err);
});

export let usersCollection: any;

function run(): void {
    try {
        client.connect();
        const db = client.db(dbName);
        usersCollection = db.collection("users");
        db.command({ping: 1}, function(err: Error, result: {ok: number}) {
            if (!err) {
                console.log("Succesful connection to MongoDB established");
            } else{
                console.log("Error occured during connection to server");
                console.log(err);
            }
        });
    } catch (err) {
        console.log(err);
    }
};
run();

export default client; 