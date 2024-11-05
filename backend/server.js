const express = require("express");
const authRouter = require("./auth/authRouter");
const app = express();
const PORT = 8000;

app.get("/", (req, res) => {
    res.send("Hello world");
});

app.use("/auth", authRouter);

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});