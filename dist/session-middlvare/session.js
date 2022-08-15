"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_session_1 = __importDefault(require("express-session"));
const uuid_1 = require("uuid");
const mongo_client_1 = __importDefault(require("../storage/v2/mongo-client"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
exports.default = (0, express_session_1.default)({
    name: "sid",
    store: connect_mongo_1.default.create({
        client: mongo_client_1.default,
        dbName: "todo",
        collectionName: "sessions",
    }),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    genid: function (req) {
        const sid = (0, uuid_1.v4)();
        console.log('Session id created: ' + sid);
        return sid;
    },
});
