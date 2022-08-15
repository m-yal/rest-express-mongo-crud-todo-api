"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const staticRouter = express_1.default.Router();
const staticPath = "";
staticRouter.get(staticPath, (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname, "../../../src/client", "index.html"));
});
exports.default = staticRouter;
