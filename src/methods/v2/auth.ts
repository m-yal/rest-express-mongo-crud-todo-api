import { InputCred, User } from '../../types/user-tasks-types';
import { Request, Response } from 'express';
import { usersCollection } from '../../storage/v2/mongo-client';

export function login(req: Request, res: Response): void | Response {
    const {login, pass}: InputCred = req.body;
    usersCollection.findOne({login: login, pass: pass}, (err: Error, result: any): void | Response => {
        if (result === null) {
            return res.end(JSON.stringify({error: "not found"}));
        } else {
            usersCollection.updateOne({login: login}, {$set: {sid: req.sessionID}});
            return res.end(JSON.stringify({ok: true}));
        }
    });
};
export function logout(req: Request, res: Response): void | Response {
    usersCollection.findOneAndUpdate(
        {sid: req.sessionID},
        {$set: {sid: ""}},
        (err: Error, result: User): void | Response => {
            if (err) {
                console.log("Erorr during cleaning sid value in db");
                return res.end();
            }
            res.clearCookie("sid");
            req.session.destroy((err: Error): Response => {
                if (err) console.error(err);
                return res.end();
            });
            res.end(JSON.stringify({ok: true}));
        }
    );
};
export function register(req: Request, res: Response): void | Response {
    const {login, pass}: InputCred = req.body;
    usersCollection.findOne({login: login}, (err: Error, isExists: User) => {
        if (isExists) return res.end();
        usersCollection.insertOne(
            {
                login: login,
                pass: pass,
                sid: req.sessionID,
                items: []
            },
            (err: Error, result: User) => {
            if (!err) {
                res.end(JSON.stringify({ok: true}));
            } else {
                console.log("Error during inserting new user to db");
                res.end();
            }
        });
    }); 
};