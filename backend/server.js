const express = require("express");
let cookieParser = require("cookie-parser");
const cors = require("cors");
let env = require("./env.json");
let { Pool } = require("pg");
let pool = new Pool(env);
const authRouter = require("./routers/authRouter");
const portfoliosRouter = require("./routers/portfoliosRouter");
const stockRouter = require("./routers/stockRouter");

const app = express();
const PORT = 8000;
const HOSTNAME = "localhost";

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static("../build"));

// Routers
app.use("/auth", authRouter);
app.use("/portfolios", portfoliosRouter);
app.use("/stock", stockRouter);

pool.connect().then(() => {
  console.log("Connected to database");
});

app.listen(PORT, HOSTNAME, () => {
  console.log(`http://${HOSTNAME}:${PORT}`);
});
