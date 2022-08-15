import express, { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { login, logout, register } from '../../methods/v2/auth';
import { createItem, getItems, deleteItem, editItem } from '../../methods/v2/crud';

const router: Router = express.Router();

router.use((req: Request, res: Response, next: NextFunction): void => {
    next();
});

type QueryAction = string | undefined;

router.post("", (req: Request, res: Response): void | Promise<Response> | Response => {
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

export default router;