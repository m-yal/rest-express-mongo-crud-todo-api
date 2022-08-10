"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const staticRouter = express_1.default.Router();
const staticPath = "";
console.log("__dirname in static.ts " + __dirname);
// app.use(express.static(path.resolve(__dirname, "../../client")));
staticRouter.get(staticPath, (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname, "../../../client", "index.html"));
});
exports.default = staticRouter;
