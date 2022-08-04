import express from 'express';
import path from 'path';
import fs from 'fs';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3005;
const idFilePath = path.resolve(__dirname, "../api/v1/id.txt");
const itemsFilePath = path.resolve(__dirname, "../api/v1/items.json");

app.use(bodyParser.json());




app.get("/api/v1/items", (req, res) => res.sendFile(itemsFilePath));
app.post("/api/v1/items", (req, res) => {
    let id: string = fs.readFileSync(idFilePath, "utf-8");
    id = (Number.parseInt(id) + 1) + "";
    fs.writeFileSync(idFilePath, id, "utf-8");
    
    const itemsJSON = JSON.parse(fs.readFileSync(itemsFilePath, "utf-8"));    
    itemsJSON.items.push({id: id, text: req.body.text, checked: false});
    fs.writeFileSync(itemsFilePath, JSON.stringify(itemsJSON), "utf-8");

    res.write(JSON.stringify({id: id}));
    res.end();
});
app.put("/api/v1/items", (req, res) => {
    const body = req.body;
    const id = body.id;
    const text = body.text;
    const checked = body.checked;

    const itemsJSON = JSON.parse(fs.readFileSync(itemsFilePath, "utf-8"));
    itemsJSON.items.map((elem: { id: any; text: any;  checked: any }) => {
        if (elem.id === id) {
            elem.text = text;
            elem.checked = checked;
        }
        return elem;
    })
    fs.writeFileSync(itemsFilePath, JSON.stringify(itemsJSON), "utf-8");

    res.write(JSON.stringify({ok: true}));
    res.end();
});
app.delete("/api/v1/items", (req, res) => {
    const body = req.body;
    const id: string = body.id;

    let itemsJSON = JSON.parse(fs.readFileSync(itemsFilePath, "utf-8"));
    itemsJSON.items = itemsJSON.items.filter((elem: { id: string; }) => elem.id != id);
    fs.writeFileSync(itemsFilePath, JSON.stringify(itemsJSON), "utf-8");

    res.write(JSON.stringify({ok: true}));
    res.end();
});


app.use(express.static(path.resolve(__dirname, "../client")));

app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "index.html"));
});



app.listen(PORT, () => console.log(`Server has been started on port ${PORT}`));