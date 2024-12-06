const express = require("express");
let cookieParser = require("cookie-parser");
const cors = require("cors");
const requireAuth = require("./middleware/requireAuth");
const authRouter = require("./routers/authRouter");
const portfoliosRouter = require("./routers/portfoliosRouter");
const stockRouter = require("./routers/stockRouter");

const app = express();
const PORT = process.env.PORT || 8000;

require("dotenv").config()
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routers
app.use("/auth", authRouter);
app.use("/portfolios", portfoliosRouter);
app.use("/stock", stockRouter);

app.get("/", requireAuth, (req, res) => {
  res.status(200);
  res.json(req.user);
});

app.listen(PORT, () => {
  console.log(`http://${process.env.HOSTNAME || "localhost"}:${PORT}`);
});
