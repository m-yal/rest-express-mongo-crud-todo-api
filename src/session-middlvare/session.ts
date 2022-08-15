import session from 'express-session';
import { v4 as uuidv4 } from 'uuid';
import client from '../storage/v2/mongo-client';
import MongoStore from 'connect-mongo';

export default session({
    name: "sid",
    store: MongoStore.create({
        client,
        dbName: "todo",
        collectionName: "sessions",
    }),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    genid: function(req) {
        const sid = uuidv4();
        console.log('Session id created: ' + sid);
        return sid;
    },
})