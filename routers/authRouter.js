const express = require("express");
let argon2 = require("argon2"); // or bcrypt, whatever
let crypto = require("crypto");
const pool = require("../db/db");
const authRouter = express.Router();
const requireAuth = require("../middleware/requireAuth");

/* returns a random 32 byte string */
const makeToken = () => crypto.randomBytes(32).toString("hex");

// must use same cookie options when setting/deleting a given cookie with res.cookie and res.clearCookie
// or else the cookie won't actually delete
// remember that the token is essentially a password that must be kept secret
let cookieOptions = {
  httpOnly: true, // client-side JS can't access this cookie; important to mitigate cross-site scripting attack damage
  secure: true, // cookie will only be sent over HTTPS connections (and localhost); important so that traffic sniffers can't see it even if our user tried to use an HTTP version of our site, if we supported that
  sameSite: "strict", // browser will only include this cookie on requests to this domain, not other domains; important to prevent cross-site request forgery attacks
};

const validateLogin = (body) => {
  const { username, password } = body;
  if(username === "" || password === "") {
    return false;
  }
  // TODO
  return true;
}

const getToken = async (token) => {
    const { rows } = await pool.query("SELECT * FROM TOKENS WHERE CODE = $1", [token]);
    return rows.length ? rows[0] : null;
};

const insertToken = async (token, userId) => {
    await pool.query(
        "INSERT INTO TOKENS (CODE, USER_ID) VALUES ($1, $2)",
        [token, userId]
    );
};

const deleteTokenByUserId = async (user_id) => {
    await pool.query(
        "DELETE FROM TOKENS where USER_ID = $1",
        [user_id]
    );
};

authRouter.post("/login", async (req, res) => {
    let { body } = req;
    // TODO validate body is correct shape and type
    if (!validateLogin(body)) {
        res.status(400);
        return res.send("Failed to validate login"); // TODO
    }
    let { username, password } = body;

    let result;
    try {
        result = await pool.query(
            "SELECT password FROM users WHERE username = $1",
            [username],
        );
    } catch (error) {
        console.log("SELECT FAILED", error);
        res.status(500);
        return res.send("Failed to check the username against the database"); // TODO
    }

    // username doesn't exist
    if (result.rows.length === 0) {
        res.status(400);
        return res.send("Username does not exist"); // TODO
    }
    let hash = result.rows[0].password;

    let verifyResult;
    try {
        verifyResult = await argon2.verify(hash, password);
    }
    catch (error) {
        console.log("VERIFY FAILED", error);
        res.status(500)
        return res.send("Failed to verify auth token"); // TODO
    }

    if (!verifyResult) {
        console.log("Invalid password");
        res.status(400);
        return res.send("Invalid password"); // TODO
    }

    // generate login token, save in cookie
    let token = makeToken();
    await insertToken(token, result.rows[0].user_id);
    return res.cookie("token", token, cookieOptions).json({ token }); // TODO
});

authRouter.post("/register", async (req, res) => {
    let { body } = req;

    // TODO validate body is correct shape and type
    if (!validateLogin(body)) {
        res.status(400);
        return res.send("Invalid parameters passed"); // TODO
    }

    let { username, password } = body;


    // check username doesn't already exist

    let result;
    try {
        result = await pool.query(
            "SELECT password FROM users WHERE username = $1",
            [username],
        );
    } catch (error) {
        console.log("SELECT FAILED", error);
        res.status(500);
        return res.send("Failed to check the username against the database"); // TODO
    }

    // username does exist
    if (result.rows.length !== 0){
        res.status(400);
        return res.send("Username already in use");
    }

    var passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])/;
    if(password.length < 12 || !passwordRegex.test(password)) {
        res.status(400);
        return res.send("Password does not meet requirements. Please use at least 12 characters, at least one of each: lowercase letter, uppercase letter and special characters"); 
    }
    // TODO validate username meet requirements
    let hash;
    try {
        hash = await argon2.hash(password);
    }
    catch (error) {
        console.log("HASH FAILED", error);
        res.status(500);
        return res.send("Password hashing failed"); // TODO
    }

    let newUser;
    try {
        newUser = (await pool.query("INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *", [
            username,
            hash,
        ])).rows[0];
    } catch (error) {
        console.log("INSERT FAILED", error);
        res.status(500);
        return res.send("Failed to insert into database"); // TODO
    }

    // automatically log people in when they create account, because why not?
    // generate login token, save in cookie
    let token = makeToken();
    await insertToken(token, newUser.user_id);
    return res.cookie("token", token, cookieOptions).json({ token }); // TODO
});

authRouter.post("/logout", requireAuth, async (req, res) => {
    
    if (!req.user) {
      console.log("Already logged out");
      res.status(400);
      return res.send("Already logged out"); // TODO
    }
    
    deleteTokenByUserId(req.user.user_id);
    
    return res.clearCookie("token", cookieOptions).send();
});

module.exports = authRouter;

