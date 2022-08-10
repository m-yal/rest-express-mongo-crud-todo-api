import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3005;
const FileStore = require('session-file-store')(session);

//* ===================== route v1 ============================== */
import crudRouter from "../routes/v1/crud";
import authRouter from '../routes/v1/auth';
import staticRouter from "../routes/v1/satic";
//* ===================== route v1 end ========================== */

app.use(bodyParser.json());
app.use(session({
    name: "sid",
    store: new FileStore({}),
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    genid: function(req) {
        const sid = uuidv4();
        console.log('Session id created: ' + sid);
        return sid;
    },
}));

/* ===================== route path v1 ===================== */
app.use("/api/v1/items", crudRouter);
app.use("/api/v1", authRouter);
app.use("/", staticRouter);
/* ===================== route path v1 ===================== */

app.listen(PORT, () => console.log(`Server has been started on port ${PORT}`));