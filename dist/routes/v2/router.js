"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const itemsFilePath = path_1.default.resolve(__dirname, "../../../api/v1/items.json");
const idFilePath = path_1.default.resolve(__dirname, "../../../api/v1/id.txt");
router.use((req, res, next) => {
    next();
});
//через один роут с разным query string: /api/v2/router?action=login|logout|register|getItems|deleteItem|addItem|editItem и по query string вызывайте уже конкретную функцию.
router.post("", (req, res) => {
    const action = req.query.action;
    switch (action) {
        case "login":
            login(req, res);
            return;
        case "logout":
            logout(req, res);
            return;
        case "register":
            register(req, res);
            return;
        case "getItems":
            getItems(req, res);
            return;
        case "deleteItem":
            deleteItem(req, res);
            return;
        case "createItem":
            createItem(req, res);
            return;
        case "editItem":
            editItem(req, res);
            return;
    }
});
const login = (req, res) => {
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
};
const logout = (req, res) => {
    const usersArr = JSON.parse(fs_1.default.readFileSync(itemsFilePath, "utf-8")).users;
    usersArr.map((user) => {
        if (user.sid === req.sessionID)
            user.sid = "";
    });
    fs_1.default.writeFileSync(itemsFilePath, JSON.stringify({ users: usersArr }), "utf-8");
    res.clearCookie("sid");
    req.session.destroy((err) => {
        if (err)
            console.error(err);
    });
    res.end(JSON.stringify({ ok: true }));
};
const register = (req, res) => {
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
};
const getItems = (req, res) => {
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
};
const deleteItem = (req, res) => {
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
};
const createItem = (req, res) => {
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
};
const editItem = (req, res) => {
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
};
exports.default = router;
