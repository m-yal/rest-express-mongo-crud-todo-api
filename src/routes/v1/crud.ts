import express, { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { User, UsersData, TaskItem } from '../../types/user-tasks-types';

const crudRounter: Router = express.Router();
const crudPath: string = "";

const itemsFilePath: string = path.resolve(__dirname, "../../../src/storage/v1/items.json");
const idFilePath: string = path.resolve(__dirname, "../../../src/storage/v1/id.txt");


crudRounter.use((req: Request, res: Response, next: NextFunction) => {
    next();
})

crudRounter.get(crudPath, (req: Request, res: Response): void | Response  =>  {
    const {usersArr, user}: UsersData = extractUsersData(req);
    if (user === undefined) return res.end(JSON.stringify({error: "forbidden"}));
    res.end(JSON.stringify({items: user.items}));
});

crudRounter.post(crudPath , (req: Request, res: Response): void | Response => {
    const {usersArr, user}: UsersData = extractUsersData(req);
    if (user === undefined) return res.end(JSON.stringify({error: "forbidden"}));
    const id: string = generateTaskId();
    user.items.push({id: id, text: req.body.text, checked: false});
    fs.writeFileSync(itemsFilePath, JSON.stringify({users: usersArr}), "utf-8");
    res.end(JSON.stringify({id: id}));
});

crudRounter.put(crudPath, (req: Request, res: Response): void | Response => {
    let {usersArr, user}: UsersData = extractUsersData(req);
    if (user === undefined) return res.end(JSON.stringify({error: "forbidden"}));
    const {id, text, checked}: TaskItem = req.body;
    user = updateTask(user, id, text, checked);
    fs.writeFileSync(itemsFilePath, JSON.stringify({users: usersArr}), "utf-8");
    res.end(JSON.stringify({ok: true}));
});

crudRounter.delete(crudPath, (req: Request, res: Response): void | Response => {
    const {usersArr, user}: UsersData = extractUsersData(req);
    if (user === undefined) return res.end(JSON.stringify({error: "forbidden"}));
    const id: string = req.body.id;
    user.items = user.items.filter((elem: { id: string; }) => elem.id != id);
    fs.writeFileSync(itemsFilePath, JSON.stringify({users: usersArr}), "utf-8");
    res.end(JSON.stringify({ok: true}));
});

function updateTask(user: User, id: string, text: string, checked: boolean): User {
    user.items.map((elem: TaskItem) => {
        if (elem.id === id) {
            elem.text = text;
            elem.checked = checked;
        }
        return elem;
    });
    return user;
}

function extractUsersData(req: Request): UsersData {
    const usersArr: User[] = JSON.parse(fs.readFileSync(itemsFilePath, "utf-8")).users;
    const user: User | undefined = usersArr.find((user: {sid: string}) => user.sid === req.session.id);
    return {usersArr, user};
}

function generateTaskId(): string {
    let id: string = fs.readFileSync(idFilePath, "utf-8");
    id = (Number.parseInt(id) + 1) + "";
    fs.writeFileSync(idFilePath, id, "utf-8");
    return id;
}

export default crudRounter;