const express = require("express");
const app = express();

let env = require("../env.json");
let apiKey = env["api-key"];

const port = 3000;
const hostname = "localhost";

app.use(express.static("../public"));

app.post("/signup", (req, res) => {
    //The request body should have the userID and a hashed password
    //The succesful response body should have the session id
});

app.post("/signin", (req, res) => {
    //The request body should have the userID and a hashed password
    //The succesful response body should have the session id
});

app.post("/addStock", (req, res) => {
    //The request body should have the session id, stock(s) to add, quantity and timestamp of purchase (may not be current timestamp)  
});

app.get("/currentStocks", (req, res) => {
    //The request should have the session id
    //The successful response body should return the stocks associated with the portfolio of the user 
});

app.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});