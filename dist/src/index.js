"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_session_1 = __importDefault(require("express-session"));
const uuid_1 = require("uuid");
const app = (0, express_1.default)();
const PORT = 3005;
const FileStore = require('session-file-store')(express_session_1.default);
//* ===================== route v1 ============================== */
const crud_1 = __importDefault(require("../routes/v1/crud"));
const auth_1 = __importDefault(require("../routes/v1/auth"));
const satic_1 = __importDefault(require("../routes/v1/satic"));
const router_1 = __importDefault(require("../routes/v2/router"));
//* ===================== route v1 end ========================== */
app.use(body_parser_1.default.json());
app.use((0, express_session_1.default)({
    name: "sid",
    store: new FileStore({}),
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    genid: function (req) {
        const sid = (0, uuid_1.v4)();
        console.log('Session id created: ' + sid);
        return sid;
    },
}));
/* ===================== route path v1 ===================== */
app.use("/api/v2/router", router_1.default);
app.use("/api/v1/items", crud_1.default);
app.use("/api/v1", auth_1.default);
app.use("/", satic_1.default);
/* ===================== route path v1 ===================== */
// app.all("/api/v2/router", (req, res, next) => {
//     console.log("accession to v2 routing");
// })
app.listen(PORT, () => console.log(`Server has been started on port ${PORT}`));
