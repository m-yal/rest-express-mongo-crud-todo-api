"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crudRounter = express_1.default.Router();
const crudPath = "";
const itemsFilePath = path_1.default.resolve(__dirname, "../../../api/v1/items.json");
const idFilePath = path_1.default.resolve(__dirname, "../../../api/v1/id.txt");
crudRounter.use((req, res, next) => {
    next();
});
crudRounter.get(crudPath, (req, res) => {
    console.log("inside get");
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
});
crudRounter.post(crudPath, (req, res) => {
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
});
crudRounter.put(crudPath, (req, res) => {
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
});
crudRounter.delete(crudPath, (req, res) => {
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
exports.default = crudRounter;
