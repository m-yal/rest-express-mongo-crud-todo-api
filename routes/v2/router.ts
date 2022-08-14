import express, { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { InputCred, User } from '../user-tasks-types';
import client from '../../api/v2/client';
import { v4 as uuidv4 } from 'uuid';


const router: Router = express.Router();
const dbName: string = "todo";
let usersCollection: any;

function run() {
    try {
        client.connect();
        const db = client.db(dbName);
        usersCollection = db.collection("users");
        db.command({ping: 1}, function(err: Error, result: any) {
            if (!err) {
                console.log("Succesful connection to server established");
            } else{
                console.log("Error occured");
                console.log(err);
            }
        });
    } catch (err) {
        console.log(err);
    }
}
run();

router.use((req: Request, res: Response, next: NextFunction): void => {
    next();
});

type QueryAction = string | undefined;

router.post("", (req: Request, res: Response) => {
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
    usersCollection.findOneAndUpdate(
        {login: login, pass: pass},
        {$set: {sid: req.sessionID}},
        (err: Error, result: {}) => {
            if (err) {
                console.log(err);
                return res.end(JSON.stringify({error: "not found"}));
            } else {
                return res.end(JSON.stringify({ok: true}));
            }
        }
    );
};
const logout = (req: Request, res: Response): void | Response => {
    usersCollection.findOneAndUpdate(
        {sid: req.sessionID},
        {$set: {sid: ""}},
        (err: Error, result: {}) => {
            if (err) {
                console.log(err);
                return res.end();
            }
            res.clearCookie("sid");
            req.session.destroy((err: Error) => {
                if (err) console.error(err);
                return res.end();
            });
            res.end(JSON.stringify({ok: true}));
        }
    );
};
const register = (req: Request, res: Response): void | Response => {
    const {login, pass}: InputCred = req.body;
    const isExist = usersCollection.findOne({login: login}, (err: Error, result: {}) => console.log(err));
    if (!isExist) {
        const user = {
            login: login,
            pass: pass,
            sid: req.sessionID,
            items: []
        };
        usersCollection.insertOne(user, (err: Error, result: {}) => {
            if (!err) {
                return res.end(JSON.stringify({ok: true}));
            } else {
                console.log(err);
                return res.end();
            }
        });
    }
};

function getItems(req: Request, res: Response) {
    usersCollection.findOne({sid: req.sessionID}, (err: Error, result: {items: any[]}) => {
        if (err || result === null) {
            console.log(err);
            return res.end(JSON.stringify({error: "forbidden"}));
        } else {
            return res.end(JSON.stringify({items: result.items}));
        }
    });
};

const deleteItem = (req: Request, res: Response): void | Response => {
    usersCollection.updateOne(
        {sid: req.sessionID},
        {$pull: {items: {id: req.body.id}}},
        (err: Error, result: {}) => {
            if (!err) return res.end(JSON.stringify({ok: true}));
            console.log(err);
            return res.end();
        });
};
const createItem = (req: Request, res: Response): void | Response => {
    const id: string = uuidv4();
    usersCollection.updateOne(
        {sid: req.sessionID},
        {$push: {items: {id: id, text: req.body.text, checked: false}}},
        (err: Error, result: {}) => {
            if (!err) return res.end(JSON.stringify({id: id}));
            console.log(err);
            return res.end();
        }
    );
};
const editItem = (req: Request, res: Response): void | Response => {
    usersCollection.updateOne(
        {sid: req.sessionID, "items.id": req.body.id},
        {$set: {"items.$.text": req.body.text, "items.$.checked": req.body.checked}},
        (err: Error, result: {}) => {
            if (!err) return res.end(JSON.stringify({ok: true}));
            console.log(err);
            return res.end();
        }
    );
};

export default router;