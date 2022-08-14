"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = __importDefault(require("../../api/v2/client"));
const uuid_1 = require("uuid");
const router = express_1.default.Router();
const dbName = "todo";
let usersCollection;
function run() {
    try {
        client_1.default.connect();
        const db = client_1.default.db(dbName);
        usersCollection = db.collection("users");
        db.command({ ping: 1 }, function (err, result) {
            if (!err) {
                console.log("Succesful connection to server established");
            }
            else {
                console.log("Error occured");
                console.log(err);
            }
        });
    }
    catch (err) {
        console.log(err);
    }
}
run();
router.use((req, res, next) => {
    next();
});
router.post("", (req, res) => {
    var _a;
    const action = (_a = req.query.action) === null || _a === void 0 ? void 0 : _a.toString();
    switch (action) {
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
    }
    ;
});
const login = (req, res) => {
    const { login, pass } = req.body;
    usersCollection.findOneAndUpdate({ login: login, pass: pass }, { $set: { sid: req.sessionID } }, (err, result) => {
        if (err) {
            console.log(err);
            return res.end(JSON.stringify({ error: "not found" }));
        }
        else {
            return res.end(JSON.stringify({ ok: true }));
        }
    });
};
const logout = (req, res) => {
    usersCollection.findOneAndUpdate({ sid: req.sessionID }, { $set: { sid: "" } }, (err, result) => {
        if (err) {
            console.log(err);
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
};
const register = (req, res) => {
    const { login, pass } = req.body;
    const isExist = usersCollection.findOne({ login: login }, (err, result) => console.log(err));
    if (!isExist) {
        const user = {
            login: login,
            pass: pass,
            sid: req.sessionID,
            items: []
        };
        usersCollection.insertOne(user, (err, result) => {
            if (!err) {
                return res.end(JSON.stringify({ ok: true }));
            }
            else {
                console.log(err);
                return res.end();
            }
        });
    }
};
function getItems(req, res) {
    usersCollection.findOne({ sid: req.sessionID }, (err, result) => {
        if (err || result === null) {
            console.log(err);
            return res.end(JSON.stringify({ error: "forbidden" }));
        }
        else {
            return res.end(JSON.stringify({ items: result.items }));
        }
    });
}
;
const deleteItem = (req, res) => {
    usersCollection.updateOne({ sid: req.sessionID }, { $pull: { items: { id: req.body.id } } }, (err, result) => {
        if (!err)
            return res.end(JSON.stringify({ ok: true }));
        console.log(err);
        return res.end();
    });
};
const createItem = (req, res) => {
    const id = (0, uuid_1.v4)();
    usersCollection.updateOne({ sid: req.sessionID }, { $push: { items: { id: id, text: req.body.text, checked: false } } }, (err, result) => {
        if (!err)
            return res.end(JSON.stringify({ id: id }));
        console.log(err);
        return res.end();
    });
};
const editItem = (req, res) => {
    usersCollection.updateOne({ sid: req.sessionID, "items.id": req.body.id }, { $set: { "items.$.text": req.body.text, "items.$.checked": req.body.checked } }, (err, result) => {
        if (!err)
            return res.end(JSON.stringify({ ok: true }));
        console.log(err);
        return res.end();
    });
};
exports.default = router;
