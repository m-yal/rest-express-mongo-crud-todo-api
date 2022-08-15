import express from 'express';
import path from 'path';

const staticRouter = express.Router();
const staticPath = "";

staticRouter.get(staticPath, (req, res) => {
    res.sendFile(path.resolve(__dirname, "../../../src/client", "index.html"));
});

export default staticRouter;