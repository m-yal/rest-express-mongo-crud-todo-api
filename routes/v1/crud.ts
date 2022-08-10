import express from 'express';
import fs from 'fs';
import path from 'path';

const crudRounter = express.Router();
const crudPath = "";

const itemsFilePath = path.resolve(__dirname, "../../../api/v1/items.json");
const idFilePath = path.resolve(__dirname, "../../../api/v1/id.txt");

crudRounter.use((req, res, next) => {
    next();
})

crudRounter.get(crudPath, (req, res) =>  {
    const usersArr = JSON.parse(fs.readFileSync(itemsFilePath, "utf-8")).users;
    const user: {sid: string, items: {}[]} | undefined = usersArr.find((user: {sid: string}) => {
        if (user.sid === req.session.id) return user;
    });
    if (user === undefined) {
        return res.end();
    }
    const items = user.items;
    res.end(JSON.stringify({items: items}));
});

crudRounter.post(crudPath , (req, res) => {
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
});

crudRounter.put(crudPath, (req, res) => {
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
});

crudRounter.delete(crudPath, (req, res) => {
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
});

export default crudRounter;