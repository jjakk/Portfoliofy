const express = require("express");
var cors = require('cors')
const authRouter = require("./auth/authRouter");
const app = express();
const PORT = 8000;

app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello world");
});

app.use("/auth", authRouter);

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});