import express from 'express';
import path from 'path';
import fs from 'fs';
import bodyParser from 'body-parser';
import session, { Session } from 'express-session';
import { stringify, v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3005;
const idFilePath = path.resolve(__dirname, "../api/v1/id.txt");
const itemsFilePath = path.resolve(__dirname, "../api/v1/items.json");
// const credentialsPath = path.resolve(__dirname, "../api/v1/credentials.json");
const FileStore = require('session-file-store')(session);


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


app.route("/api/v1/items")
    .get((req, res) =>  {
        const usersArr = JSON.parse(fs.readFileSync(itemsFilePath, "utf-8")).users;
        const user: {sid: string, items: {}[]} | undefined = usersArr.find((user: {sid: string}) => {
            if (user.sid === req.session.id) return user;
        });
        if (user === undefined) {
            return res.end();
        }
        const items = user.items;
        res.end(JSON.stringify({items: items}));
    })
    .post((req, res) => {
        let id: string = fs.readFileSync(idFilePath, "utf-8");
        id = (Number.parseInt(id) + 1) + "";
        fs.writeFileSync(idFilePath, id, "utf-8");

        const usersArr = JSON.parse(fs.readFileSync(itemsFilePath, "utf-8")).users;
        const user: {sid: string, items: {}[]} | undefined = usersArr.find((user: {sid: string}) => {
            if (user.sid === req.session.id) return user;
        });
        if (user === undefined) {
            return res.end();
        }

        const items = user.items;
        items.push({id: id, text: req.body.text, checked: false});
        fs.writeFileSync(itemsFilePath, JSON.stringify({users: usersArr}), "utf-8");
        res.end(JSON.stringify({id: id}));
    })
    .put((req, res) => {
        const usersArr = JSON.parse(fs.readFileSync(itemsFilePath, "utf-8")).users;
        const user = usersArr.find((user: {sid: string}) => {
            if (user.sid === req.session.id) return user;
        });
        if (user === undefined) {
            return res.end();
        }

        const {id, text, checked} = req.body;
        user.items.map((elem: {id: string, text: string, checked: boolean}) => {
            if (elem.id === id) {
                elem.text = text;
                elem.checked = checked;
            }
            return elem;
        })
        fs.writeFileSync(itemsFilePath, JSON.stringify({users: usersArr}), "utf-8");
        res.end(JSON.stringify({ok: true}));
    })
    .delete((req, res) => {
        const usersArr = JSON.parse(fs.readFileSync(itemsFilePath, "utf-8")).users;
        const user = usersArr.find((user: {sid: string}) => {
            if (user.sid === req.session.id) return user;
        });
        if (user === undefined) {
            return res.end();
        }

        const id: string = req.body.id;
        user.items = user.items.filter((elem: { id: string; }) => elem.id != id);
        fs.writeFileSync(itemsFilePath, JSON.stringify({users: usersArr}), "utf-8");
        res.end(JSON.stringify({ok: true}));
});


app.post("/api/v1/login", (req, res) => {
    const {login, pass} = req.body;

    if (login && pass) {
        const usersArr = JSON.parse(fs.readFileSync(itemsFilePath, "utf-8")).users;
        const user: {login: string, pass: string, sid: string} | undefined = usersArr.find((user: {login: string, pass: string}) => {
            if (user.login === login && user.pass === pass) return true;
        });
        if (user) {
            user.sid = req.sessionID;
            fs.writeFileSync(itemsFilePath, JSON.stringify({users: usersArr}), "utf-8");
            return res.end(JSON.stringify({ok: true}));
        }
    }
    res.end();
});
// ничего не принимает, но в итоге рубит сессию, тоже может вернуть { "ok": true }
app.post("/api/v1/logout", (req, res) => {
    //delete sid from user`s field
    const usersArr = JSON.parse(fs.readFileSync(itemsFilePath, "utf-8")).users;
    const user: {login: string, pass: string, sid: string} | undefined = usersArr.map((user: {sid: string}) => {
        if (user.sid === req.sessionID) user.sid = "";
    });
    fs.writeFileSync(itemsFilePath, JSON.stringify({users: usersArr}), "utf-8");

    res.clearCookie("sid");
    req.session.destroy(err => {
        if (err) console.error(err);
    });
    res.end(JSON.stringify({ok: true}));
});
//  принимает { "login": "...", "pass": "..." } и возвращает { "ok": true } 
app.post("/api/v1/register", (req, res) => {
    const {login, pass} = req.body;
    if (login && pass) {
        const usersArr = JSON.parse(fs.readFileSync(itemsFilePath, "utf-8")).users;
        const user = usersArr.find((user: {login: string}) => {
            if (user.login === login) return user;
        });
        
        if (user) {
            return res.end();
        } else {
            //add new acc to items.json
            usersArr.push({login: login, pass: pass, sid: `${req.sessionID}`, items: []});
            fs.writeFileSync(itemsFilePath, JSON.stringify({users: usersArr}), "utf-8");
            return res.end(JSON.stringify({ok: true}));
        }
    }
    res.end();
});


app.use(express.static(path.resolve(__dirname, "../client")));

app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "index.html"));
});



app.listen(PORT, () => console.log(`Server has been started on port ${PORT}`));