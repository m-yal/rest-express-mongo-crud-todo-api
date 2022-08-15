"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editItem = exports.createItem = exports.deleteItem = exports.getItems = void 0;
const mongo_client_1 = require("../../storage/v2/mongo-client");
const uuid_1 = require("uuid");
function getItems(req, res) {
    mongo_client_1.usersCollection.findOne({ sid: req.sessionID }, (err, result) => {
        if (err || result === null) {
            console.log(err);
            return res.end(JSON.stringify({ error: "forbidden" }));
        }
        else {
            return res.end(JSON.stringify({ items: result.items }));
        }
    });
}
exports.getItems = getItems;
;
function deleteItem(req, res) {
    mongo_client_1.usersCollection.updateOne({ sid: req.sessionID }, { $pull: { items: { id: req.body.id } } }, (err, result) => {
        if (!err)
            return res.end(JSON.stringify({ ok: true }));
        console.log(err);
        return res.end();
    });
}
exports.deleteItem = deleteItem;
;
function createItem(req, res) {
    const id = (0, uuid_1.v4)();
    mongo_client_1.usersCollection.updateOne({ sid: req.sessionID }, { $push: { items: { id: id, text: req.body.text, checked: false } } }, (err, result) => {
        if (!err)
            return res.end(JSON.stringify({ id: id }));
        console.log(err);
        return res.end();
    });
}
exports.createItem = createItem;
;
function editItem(req, res) {
    mongo_client_1.usersCollection.updateOne({ sid: req.sessionID, "items.id": req.body.id }, { $set: { "items.$.text": req.body.text, "items.$.checked": req.body.checked } }, (err, result) => {
        if (!err)
            return res.end(JSON.stringify({ ok: true }));
        console.log(err);
        return res.end();
    });
}
exports.editItem = editItem;
;
