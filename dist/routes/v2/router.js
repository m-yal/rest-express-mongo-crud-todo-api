"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../methods/v2/auth");
const crud_1 = require("../../methods/v2/crud");
const router = express_1.default.Router();
router.use((req, res, next) => {
    next();
});
router.post("", (req, res) => {
    var _a;
    const action = (_a = req.query.action) === null || _a === void 0 ? void 0 : _a.toString();
    switch (action) {
        case "login":
            return (0, auth_1.login)(req, res);
        case "logout":
            return (0, auth_1.logout)(req, res);
        case "register":
            return (0, auth_1.register)(req, res);
        case "getItems":
            return (0, crud_1.getItems)(req, res);
        case "deleteItem":
            return (0, crud_1.deleteItem)(req, res);
        case "createItem":
            return (0, crud_1.createItem)(req, res);
        case "editItem":
            return (0, crud_1.editItem)(req, res);
    }
    ;
});
exports.default = router;
