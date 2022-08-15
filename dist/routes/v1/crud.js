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
const itemsFilePath = path_1.default.resolve(__dirname, "../../../src/storage/v1/items.json");
const idFilePath = path_1.default.resolve(__dirname, "../../../src/storage/v1/id.txt");
crudRounter.use((req, res, next) => {
    next();
});
crudRounter.get(crudPath, (req, res) => {
    const { usersArr, user } = extractUsersData(req);
    if (user === undefined)
        return res.end(JSON.stringify({ error: "forbidden" }));
    res.end(JSON.stringify({ items: user.items }));
});
crudRounter.post(crudPath, (req, res) => {
    const { usersArr, user } = extractUsersData(req);
    if (user === undefined)
        return res.end(JSON.stringify({ error: "forbidden" }));
    const id = generateTaskId();
    user.items.push({ id: id, text: req.body.text, checked: false });
    fs_1.default.writeFileSync(itemsFilePath, JSON.stringify({ users: usersArr }), "utf-8");
    res.end(JSON.stringify({ id: id }));
});
crudRounter.put(crudPath, (req, res) => {
    let { usersArr, user } = extractUsersData(req);
    if (user === undefined)
        return res.end(JSON.stringify({ error: "forbidden" }));
    const { id, text, checked } = req.body;
    user = updateTask(user, id, text, checked);
    fs_1.default.writeFileSync(itemsFilePath, JSON.stringify({ users: usersArr }), "utf-8");
    res.end(JSON.stringify({ ok: true }));
});
crudRounter.delete(crudPath, (req, res) => {
    const { usersArr, user } = extractUsersData(req);
    if (user === undefined)
        return res.end(JSON.stringify({ error: "forbidden" }));
    const id = req.body.id;
    user.items = user.items.filter((elem) => elem.id != id);
    fs_1.default.writeFileSync(itemsFilePath, JSON.stringify({ users: usersArr }), "utf-8");
    res.end(JSON.stringify({ ok: true }));
});
function updateTask(user, id, text, checked) {
    user.items.map((elem) => {
        if (elem.id === id) {
            elem.text = text;
            elem.checked = checked;
        }
        return elem;
    });
    return user;
}
function extractUsersData(req) {
    const usersArr = JSON.parse(fs_1.default.readFileSync(itemsFilePath, "utf-8")).users;
    const user = usersArr.find((user) => user.sid === req.session.id);
    return { usersArr, user };
}
function generateTaskId() {
    let id = fs_1.default.readFileSync(idFilePath, "utf-8");
    id = (Number.parseInt(id) + 1) + "";
    fs_1.default.writeFileSync(idFilePath, id, "utf-8");
    return id;
}
exports.default = crudRounter;
