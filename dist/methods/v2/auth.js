"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.logout = exports.login = void 0;
const mongo_client_1 = require("../../storage/v2/mongo-client");
function login(req, res) {
    const { login, pass } = req.body;
    mongo_client_1.usersCollection.findOne({ login: login, pass: pass }, (err, result) => {
        if (result === null) {
            return res.end(JSON.stringify({ error: "not found" }));
        }
        else {
            mongo_client_1.usersCollection.updateOne({ login: login }, { $set: { sid: req.sessionID } });
            return res.end(JSON.stringify({ ok: true }));
        }
    });
}
exports.login = login;
;
function logout(req, res) {
    mongo_client_1.usersCollection.findOneAndUpdate({ sid: req.sessionID }, { $set: { sid: "" } }, (err, result) => {
        console.log("LOGOUTing: " + result.sid);
        if (err) {
            console.log("Erorr during cleaning sid value in db");
            return res.end();
        }
        res.clearCookie("sid");
        req.session.destroy((err) => {
            if (err)
                console.error(err);
            return res.end();
        });
        res.end(JSON.stringify({ ok: true }));
    });
}
exports.logout = logout;
;
function register(req, res) {
    const { login, pass } = req.body;
    mongo_client_1.usersCollection.findOne({ login: login }, (err, isExists) => {
        if (isExists)
            return res.end();
        mongo_client_1.usersCollection.insertOne({
            login: login,
            pass: pass,
            sid: req.sessionID,
            items: []
        }, (err, result) => {
            if (!err) {
                res.end(JSON.stringify({ ok: true }));
            }
            else {
                console.log("Error during inserting new user to db");
                res.end();
            }
        });
    });
}
exports.register = register;
;
