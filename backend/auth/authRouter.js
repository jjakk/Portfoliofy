const { Router } = require("express");

const authRouter = Router();

authRouter.post("/login", (req, res) => {
    res.json({ token: "abc" });
});

authRouter.post("/register", (req, res) => {
    res.json({ token: "abc" });
})

module.exports = authRouter;