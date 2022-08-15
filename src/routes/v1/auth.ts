import express, { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { User, InputCred } from '../../types/user-tasks-types';
import { Request, Response, NextFunction } from 'express';

const authRouter: Router = express.Router();
const itemsFilePath: string = path.resolve(__dirname, "../../../src/storage/v1/items.json");

authRouter.use((req: Request, res: Response, next: NextFunction): void => {
    next();
});

authRouter.post("/login", (req: Request, res: Response): void | Response => {
    const {login, pass}: InputCred = req.body;
    if (login && pass) {
        const usersArr: User[] = JSON.parse(fs.readFileSync(itemsFilePath, "utf-8")).users;
        const user: User | undefined = usersArr.find((user: User) => user.login === login && user.pass === pass);
        if (user) {
            user.sid = req.sessionID;
            fs.writeFileSync(itemsFilePath, JSON.stringify({users: usersArr}), "utf-8");
            return res.end(JSON.stringify({ok: true}));
        } else {
            return res.end(JSON.stringify({error: "not found"}));
        }
    }
    res.end({error: "invalid input: empty input"});
});

authRouter.post("/logout", (req: Request, res: Response): void => {
    const usersArr: User[] = JSON.parse(fs.readFileSync(itemsFilePath, "utf-8")).users;
    usersArr.map((user: User) => {
        if (user.sid === req.sessionID) user.sid = "";
    });
    fs.writeFileSync(itemsFilePath, JSON.stringify({users: usersArr}), "utf-8");

    res.clearCookie("sid");
    req.session.destroy((err: Error): void => {
        if (err) console.error(err);
    });
    res.end(JSON.stringify({ok: true}));
});

authRouter.post("/register", (req: Request, res: Response): void | Response => {
    const {login, pass}: InputCred = req.body;
    if (login && pass) {
        const usersArr: User[] = JSON.parse(fs.readFileSync(itemsFilePath, "utf-8")).users;
        const user: User | undefined = usersArr.find((user: User) => {
            if (user.login === login) return user;
        });
        
        if (!user) {
            usersArr.push({login: login, pass: pass, sid: `${req.sessionID}`, items: []});
            fs.writeFileSync(itemsFilePath, JSON.stringify({users: usersArr}), "utf-8");
            return res.end(JSON.stringify({ok: true}));
        } 
    }
    res.end();
});

export default authRouter;