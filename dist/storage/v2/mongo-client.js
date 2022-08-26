"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersCollection = void 0;
const { MongoClient, ServerApiVersion } = require('mongodb');
const dbLogin = "max";
const dbPass = "1T2O3D4O5";
const uri = `mongodb+srv://${dbLogin}:${dbPass}@cluster0.1p03jj1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const dbName = "todo";
client.connect((err) => {
    if (err)
        return console.log(err);
});
function run() {
    try {
        client.connect();
        const db = client.db(dbName);
        exports.usersCollection = db.collection("users");
        db.command({ ping: 1 }, function (err, result) {
            if (!err) {
                console.log("Succesful connection to MongoDB established");
            }
            else {
                console.log("Error occured during connection to server");
                console.log(err);
            }
        });
    }
    catch (err) {
        console.log(err);
    }
}
;
run();
exports.default = client;
