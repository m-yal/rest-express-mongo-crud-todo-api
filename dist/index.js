"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_session_1 = __importDefault(require("express-session"));
const uuid_1 = require("uuid");
const app = (0, express_1.default)();
const PORT = 3005;
const idFilePath = path_1.default.resolve(__dirname, "../api/v1/id.txt");
const itemsFilePath = path_1.default.resolve(__dirname, "../api/v1/items.json");
// const credentialsPath = path.resolve(__dirname, "../api/v1/credentials.json");
const FileStore = require('session-file-store')(express_session_1.default);
app.use(body_parser_1.default.json());
app.use((0, express_session_1.default)({
    name: "sid",
    store: new FileStore({}),
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    genid: function (req) {
        const sid = (0, uuid_1.v4)();
        console.log('Session id created: ' + sid);
        return sid;
    },
}));
app.route("/api/v1/items")
    .get((req, res) => {
    const usersArr = JSON.parse(fs_1.default.readFileSync(itemsFilePath, "utf-8")).users;
    const user = usersArr.find((user) => {
        if (user.sid === req.session.id)
            return user;
    });
    if (user === undefined) {
        return res.end();
    }
    const items = user.items;
    res.end(JSON.stringify({ items: items }));
})
    .post((req, res) => {
    let id = fs_1.default.readFileSync(idFilePath, "utf-8");
    id = (Number.parseInt(id) + 1) + "";
    fs_1.default.writeFileSync(idFilePath, id, "utf-8");
    const usersArr = JSON.parse(fs_1.default.readFileSync(itemsFilePath, "utf-8")).users;
    const user = usersArr.find((user) => {
        if (user.sid === req.session.id)
            return user;
    });
    if (user === undefined) {
        return res.end();
    }
    const items = user.items;
    items.push({ id: id, text: req.body.text, checked: false });
    fs_1.default.writeFileSync(itemsFilePath, JSON.stringify({ users: usersArr }), "utf-8");
    res.end(JSON.stringify({ id: id }));
})
    .put((req, res) => {
    const usersArr = JSON.parse(fs_1.default.readFileSync(itemsFilePath, "utf-8")).users;
    const user = usersArr.find((user) => {
        if (user.sid === req.session.id)
            return user;
    });
    if (user === undefined) {
        return res.end();
    }
    const { id, text, checked } = req.body;
    user.items.map((elem) => {
        if (elem.id === id) {
            elem.text = text;
            elem.checked = checked;
        }
        return elem;
    });
    fs_1.default.writeFileSync(itemsFilePath, JSON.stringify({ users: usersArr }), "utf-8");
    res.end(JSON.stringify({ ok: true }));
})
    .delete((req, res) => {
    const usersArr = JSON.parse(fs_1.default.readFileSync(itemsFilePath, "utf-8")).users;
    const user = usersArr.find((user) => {
        if (user.sid === req.session.id)
            return user;
    });
    if (user === undefined) {
        return res.end();
    }
    const id = req.body.id;
    user.items = user.items.filter((elem) => elem.id != id);
    fs_1.default.writeFileSync(itemsFilePath, JSON.stringify({ users: usersArr }), "utf-8");
    res.end(JSON.stringify({ ok: true }));
});
app.post("/api/v1/login", (req, res) => {
    const { login, pass } = req.body;
    if (login && pass) {
        const usersArr = JSON.parse(fs_1.default.readFileSync(itemsFilePath, "utf-8")).users;
        const user = usersArr.find((user) => {
            if (user.login === login && user.pass === pass)
                return true;
        });
        if (user) {
            user.sid = req.sessionID;
            fs_1.default.writeFileSync(itemsFilePath, JSON.stringify({ users: usersArr }), "utf-8");
            return res.end(JSON.stringify({ ok: true }));
        }
    }
    res.end();
});
// ничего не принимает, но в итоге рубит сессию, тоже может вернуть { "ok": true }
app.post("/api/v1/logout", (req, res) => {
    //delete sid from user`s field
    const usersArr = JSON.parse(fs_1.default.readFileSync(itemsFilePath, "utf-8")).users;
    const user = usersArr.map((user) => {
        if (user.sid === req.sessionID)
            user.sid = "";
    });
    fs_1.default.writeFileSync(itemsFilePath, JSON.stringify({ users: usersArr }), "utf-8");
    res.clearCookie("sid");
    req.session.destroy(err => {
        if (err)
            console.error(err);
    });
    res.end(JSON.stringify({ ok: true }));
});
//  принимает { "login": "...", "pass": "..." } и возвращает { "ok": true } 
app.post("/api/v1/register", (req, res) => {
    const { login, pass } = req.body;
    if (login && pass) {
        const usersArr = JSON.parse(fs_1.default.readFileSync(itemsFilePath, "utf-8")).users;
        const user = usersArr.find((user) => {
            if (user.login === login)
                return user;
        });
        if (user) {
            return res.end();
        }
        else {
            //add new acc to items.json
            usersArr.push({ login: login, pass: pass, sid: `${req.sessionID}`, items: [] });
            fs_1.default.writeFileSync(itemsFilePath, JSON.stringify({ users: usersArr }), "utf-8");
            return res.end(JSON.stringify({ ok: true }));
        }
    }
    res.end();
});
app.use(express_1.default.static(path_1.default.resolve(__dirname, "../client")));
app.get("/", (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname, "../client", "index.html"));
});
app.listen(PORT, () => console.log(`Server has been started on port ${PORT}`));
