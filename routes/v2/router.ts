import express, { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { InputCred } from '../user-tasks-types';

const router: Router = express.Router();

const itemsFilePath: string = path.resolve(__dirname, "../../../api/v1/items.json");
const idFilePath: string = path.resolve(__dirname, "../../../api/v1/id.txt");

router.use((req: Request, res: Response, next: NextFunction): void => {
    next();
});

type QueryAction = string | undefined;

//через один роут с разным query string: /api/v2/router?action=login|logout|register|getItems|deleteItem|addItem|editItem и по query string вызывайте уже конкретную функцию.
router.post("", (req: Request, res: Response): void | Response => {
    const action: QueryAction = req.query.action?.toString();
    switch(action) {
        case "login":
            return login(req, res);
        case "logout":
            return logout(req, res);
        case "register":
            return register(req, res);
        case "getItems":
            return getItems(req, res);
        case "deleteItem":
            return deleteItem(req, res);
        case "createItem":
            return createItem(req, res);
        case "editItem":
            return editItem(req, res);
    };
});

const login = (req: Request, res: Response): void | Response => {
    const {login, pass}: InputCred = req.body;
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
};
const logout = (req: Request, res: Response): void | Response => {
    const usersArr = JSON.parse(fs.readFileSync(itemsFilePath, "utf-8")).users;
    usersArr.map((user: {sid: string}) => {
        if (user.sid === req.sessionID) user.sid = "";
    });
    fs.writeFileSync(itemsFilePath, JSON.stringify({users: usersArr}), "utf-8");

    res.clearCookie("sid");
    req.session.destroy((err: Error) => {
        if (err) console.error(err);
    });
    res.end(JSON.stringify({ok: true}));
};
const register = (req: Request, res: Response): void | Response => {
    const {login, pass}: InputCred = req.body;
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
};

const getItems = (req: Request, res: Response): void | Response => {
    const usersArr = JSON.parse(fs.readFileSync(itemsFilePath, "utf-8")).users;
    const user: {sid: string, items: {}[]} | undefined = usersArr.find((user: {sid: string}) => {
        if (user.sid === req.session.id) return user;
    });
    if (user === undefined) {
        return res.end(JSON.stringify({error: "forbidden"}));
    }
    const items = user.items;
    res.end(JSON.stringify({items: items}));
}

const deleteItem = (req: Request, res: Response): void | Response => {
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
};
const createItem = (req: Request, res: Response): void | Response => {
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
};
const editItem = (req: Request, res: Response): void | Response => {
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
};

export default router;