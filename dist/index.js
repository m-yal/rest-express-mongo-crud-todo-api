"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
const PORT = 3005;
const idFilePath = path_1.default.resolve(__dirname, "../api/v1/id.txt");
const itemsFilePath = path_1.default.resolve(__dirname, "../api/v1/items.json");
app.use(body_parser_1.default.json());
app.get("/api/v1/items", (req, res) => res.sendFile(itemsFilePath));
app.post("/api/v1/items", (req, res) => {
    let id = fs_1.default.readFileSync(idFilePath, "utf-8");
    id = (Number.parseInt(id) + 1) + "";
    fs_1.default.writeFileSync(idFilePath, id, "utf-8");
    const itemsJSON = JSON.parse(fs_1.default.readFileSync(itemsFilePath, "utf-8"));
    itemsJSON.items.push({ id: id, text: req.body.text, checked: false });
    fs_1.default.writeFileSync(itemsFilePath, JSON.stringify(itemsJSON), "utf-8");
    res.write(JSON.stringify({ id: id }));
    res.end();
});
app.put("/api/v1/items", (req, res) => {
    const body = req.body;
    const id = body.id;
    const text = body.text;
    const checked = body.checked;
    const itemsJSON = JSON.parse(fs_1.default.readFileSync(itemsFilePath, "utf-8"));
    itemsJSON.items.map((elem) => {
        if (elem.id === id) {
            elem.text = text;
            elem.checked = checked;
        }
        return elem;
    });
    fs_1.default.writeFileSync(itemsFilePath, JSON.stringify(itemsJSON), "utf-8");
    res.write(JSON.stringify({ ok: true }));
    res.end();
});
app.delete("/api/v1/items", (req, res) => {
    const body = req.body;
    const id = body.id;
    let itemsJSON = JSON.parse(fs_1.default.readFileSync(itemsFilePath, "utf-8"));
    itemsJSON.items = itemsJSON.items.filter((elem) => elem.id != id);
    fs_1.default.writeFileSync(itemsFilePath, JSON.stringify(itemsJSON), "utf-8");
    res.write(JSON.stringify({ ok: true }));
    res.end();
});
app.use(express_1.default.static(path_1.default.resolve(__dirname, "../client")));
app.get("/", (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname, "../client", "index.html"));
});
app.listen(PORT, () => console.log(`Server has been started on port ${PORT}`));
