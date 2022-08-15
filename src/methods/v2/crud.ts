import { User } from '../../types/user-tasks-types';
import { Request, Response } from 'express';
import { usersCollection } from '../../storage/v2/mongo-client';
import { v4 as uuidv4 } from 'uuid';

export function getItems(req: Request, res: Response): void | Response {
    usersCollection.findOne({sid: req.sessionID}, (err: Error, result: User) => {
        if (err || result === null) {
            console.log(err);
            return res.end(JSON.stringify({error: "forbidden"}));
        } else {
            return res.end(JSON.stringify({items: result.items}));
        }
    });
};

export function deleteItem(req: Request, res: Response): void | Response {
    usersCollection.updateOne(
        {sid: req.sessionID},
        {$pull: {items: {id: req.body.id}}},
        (err: Error, result: User) => {
            if (!err) return res.end(JSON.stringify({ok: true}));
            console.log(err);
            return res.end();
        });
};

export function createItem(req: Request, res: Response): void | Response {
    const id: string = uuidv4();
    usersCollection.updateOne(
        {sid: req.sessionID},
        {$push: {items: {id: id, text: req.body.text, checked: false}}},
        (err: Error, result: User) => {
            if (!err) return res.end(JSON.stringify({id: id}));
            console.log(err);
            return res.end();
        }
    );
};

export function editItem(req: Request, res: Response): void | Response {
    usersCollection.updateOne(
        {sid: req.sessionID, "items.id": req.body.id},
        {$set: {"items.$.text": req.body.text, "items.$.checked": req.body.checked}},
        (err: Error, result: User) => {
            if (!err) return res.end(JSON.stringify({ok: true}));
            console.log(err);
            return res.end();
        }
    );
};