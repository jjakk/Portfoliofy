const express = require("express");
let argon2 = require("argon2"); // or bcrypt, whatever
let crypto = require("crypto");
const pool = require("../db/db");
const authRouter = express.Router();

// global object for storing tokens
// in a real app, we'd save them to a db so even if the server exits
// users will still be logged in when it restarts
let tokenStorage = {};

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
    console.log(username, password, hash);

    let verifyResult;
    try {
        verifyResult = await argon2.verify(hash, password);
    }
    catch (error) {
        console.log("VERIFY FAILED", error);
        res.status(500)
        return res.send("Failed to verify auth token"); // TODO
    }

    // password didn't match
    console.log(verifyResult);
    if (!verifyResult) {
        console.log("Invalid password");
        res.status(400);
        return res.send("Invalid password"); // TODO
    }

    // generate login token, save in cookie
    let token = makeToken();
    console.log("Generated token", token);
    tokenStorage[token] = username;
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
    console.log(username, password);


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

    console.log(hash); // TODO just for debugging
    try {
        await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
            username,
            hash,
        ]);
    } catch (error) {
        console.log("INSERT FAILED", error);
        res.status(500);
        return res.send("Failed to insert into database"); // TODO
    }

    // automatically log people in when they create account, because why not?
    // generate login token, save in cookie
    let token = makeToken();
    console.log("Generated token", token);
    tokenStorage[token] = username;
    return res.cookie("token", token, cookieOptions).json({ token }); // TODO
});

authRouter.post("/logout", (req, res) => {
    let { token } = req.cookies;
    
    if (token === undefined) {
      console.log("Already logged out");
      res.status(400);
      return res.send("Already logged out"); // TODO
    }
    
    if (!tokenStorage.hasOwnProperty(token)) {
      console.log("Token doesn't exist");
      res.status(400);
      return res.send("Token doesn't exist"); // TODO
    }
    
    console.log("Before", tokenStorage);
    delete tokenStorage[token];
    console.log("Deleted", tokenStorage);
    
    return res.clearCookie("token", cookieOptions).send();
});

module.exports = authRouter;

