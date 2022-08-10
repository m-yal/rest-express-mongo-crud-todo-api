import express, { json } from 'express';
import fs from 'fs';
import path from 'path';

const authRouter = express.Router();
const itemsFilePath = path.resolve(__dirname, "../../../api/v1/items.json");

authRouter.use((req, res, next) => {
    next();
})

authRouter.post("/login", (req, res) => {
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
        } else {
            res.end(JSON.stringify({error: "not found"}));
        }
    }
    res.end();
});
// ничего не принимает, но в итоге рубит сессию, тоже может вернуть { "ok": true }
authRouter.post("/logout", (req, res) => {
    const usersArr = JSON.parse(fs.readFileSync(itemsFilePath, "utf-8")).users;
    usersArr.map((user: {sid: string}) => {
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
authRouter.post("/register", (req, res) => {
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

export default authRouter;
