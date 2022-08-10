"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const authRouter = express_1.default.Router();
const itemsFilePath = path_1.default.resolve(__dirname, "../../../api/v1/items.json");
authRouter.use((req, res, next) => {
    next();
});
authRouter.post("/login", (req, res) => {
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
authRouter.post("/logout", (req, res) => {
    console.log("inside logout");
    const usersArr = JSON.parse(fs_1.default.readFileSync(itemsFilePath, "utf-8")).users;
    usersArr.map((user) => {
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
authRouter.post("/register", (req, res) => {
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
exports.default = authRouter;
