const express = require("express");
let env = require("../env.json");
let API_KEY = env["api-key"];
let { Pool } = require("pg");
let argon2 = require("argon2"); // or bcrypt, whatever
let cookieParser = require("cookie-parser");
let crypto = require("crypto");
const cors = require("cors");
let pool = new Pool(env);

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const PORT = 8000;
const hostname = "localhost";

app.use(express.static("../build"));

pool.connect().then(() => {
console.log("Connected to database");
});

// global object for storing tokens
// in a real app, we'd save them to a db so even if the server exits
// users will still be logged in when it restarts
let tokenStorage = {};

/* returns a random 32 byte string */
function makeToken() {
return crypto.randomBytes(32).toString("hex");
}

// must use same cookie options when setting/deleting a given cookie with res.cookie and res.clearCookie
// or else the cookie won't actually delete
// remember that the token is essentially a password that must be kept secret
let cookieOptions = {
httpOnly: true, // client-side JS can't access this cookie; important to mitigate cross-site scripting attack damage
secure: true, // cookie will only be sent over HTTPS connections (and localhost); important so that traffic sniffers can't see it even if our user tried to use an HTTP version of our site, if we supported that
sameSite: "strict", // browser will only include this cookie on requests to this domain, not other domains; important to prevent cross-site request forgery attacks
};

function validateLogin(body) {
const { username, password } = body;
if(username === "" || password === "") {
  return false;
}
// TODO
return true;
}

app.post("/auth/register", async (req, res) => {
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

  var specialCharRegex = /.([`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])./;
  var lowercaseRegex = /.[a-z]./;
  var uppercaseRegex = /.[A-Z]./;
  var numberRegex = /.[0-9]./;
  
  if(password.length < 12 || !specialCharRegex.test(password) || !lowercaseRegex.test(password) || !uppercaseRegex.test(password) || !numberRegex.test(password))
  {
    res.status(400);
    return res.send("Password does not meet requirements. Please use at least 12 characters, at least one of each: lowercase letter, uppercase letter and special characters"); 
  }
  // TODO validate username meet requirements
  let hash;
  try {
    hash = await argon2.hash(password);
  } catch (error) {
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

app.post("/auth/login", async (req, res) => {
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
} catch (error) {
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

/* middleware; check if login token in token storage, if not, 403 response */
let authorize = (req, res, next) => {
let { token } = req.cookies;
console.log(token, tokenStorage);
if (token === undefined || !tokenStorage.hasOwnProperty(token)) {
  res.status(403);
  return res.send("Token not found"); // TODO
}
next();
};

app.post("/logout", (req, res) => {
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

app.post("/addStock", authorize, async (req, res) => {
  //The request body should have the stock(s) to add, quantity and timestamp of purchase (may not be current timestamp)
  const { tickerSymbol, portfolioId, quantity, pricePerShare, timestamp } = req.body;

  // Check if all parameters are defined 
  if (!tickerSymbol || !portfolioId || !quantity || !pricePerShare) {
      return res.status(400).json({ error: "Missing required fields" });
  }

  const transactionDate = timestamp;

  try {
    // Check if stock exists in STOCKS table
    const stockCheck = await pool.query(
      "SELECT * FROM STOCKS WHERE TICKER_SYMBOL = $1",
      [tickerSymbol]
    );

    if (stockCheck.rowCount === 0) {
      await pool.query(
        "INSERT INTO STOCKS (TICKER_SYMBOL, NAME) VALUES ($1, $2)",
        [tickerSymbol, stockName]
      );
    }

    // Insert new transaction into TRANSACTIONS table
    const transactionId = generateUniqueId(); // Replace with your preferred ID generation logic
    const totalAmount = quantity * pricePerShare;

    await pool.query(
      `INSERT INTO TRANSACTIONS (TRANSACTION_ID, TOTAL_AMOUNT, QUANTITY, PRICE_PER_SHARE, TRANSACTION_DATE, TYPE_ID, STOCKS_TICKER_SYMBOL, PORTFOLIO_ID) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [transactionId, totalAmount, quantity, pricePerShare, transactionDate, 'buy', tickerSymbol, portfolioId]
    );

    res.status(200).json({ message: "Stock added successfully", transactionId });
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).json({ error: "An error occurred while adding the stock" });
  }
});


app.get("/currentStocks", authorize, async (req, res) => {
  const { userId, portfolioId } = req.query;
  //The successful response body should return the stocks associated with the portfolio of the user 
  try {
    // Check if the portfolio is associated with the user
    const portfolioCheck = await pool.query(
      "SELECT * FROM PORTFOLIOS WHERE PORTFOLIO_ID = $1 AND USER_ID = $2",
      [portfolioId, userId]
    );
    // If no portfolio, return an error
    if (portfolioCheck.rowCount === 0) {
      return res.status(404).json({ error: "Portfolio not found for this user" });
    }
    // Query to get stocks associated with the portfolio
    const result = await pool.query(
      `SELECT s.TICKER_SYMBOL, s.NAME
        FROM STOCKS s
        INNER JOIN STOCKS_PORTFOLIOS sp ON s.TICKER_SYMBOL = sp.TICKER_SYMBOL
        WHERE sp.PORTFOLIO_ID = $1`,
      [portfolioId]
    );

    // Return the stocks data
    res.status(200).json({ stocks: result.rows });
  } catch (error) {
    console.error("Error fetching stocks:", error);
    res.status(500).json({ error: "An error occurred while retrieving stocks" });
  }
});

app.get("/stocks", async (req, res) => {
    const { ticker, timeframe } = req.query;
    let from = new Date();
    switch(timeframe) {
      case "1d":
        from.setDate(from.getDate() - 1);
        break;
      case "1w":
        from.setDate(from.getDate() - 7);
        break;
      case "1m":
        from.setDate(from.getDate() - 30);
        break;
      case "3m":
        from.setDate(from.getDate() - (30 * 3));
        break;
      case "6m":
        from.setDate(from.getDate() - (30 * 6));
        break;
      case "ytd":
        from = new Date(new Date().getFullYear(), 0, 1);
        break;
      case "1y":
        from.setDate(from.getDate() - (365));
        break;
      case "2y":
        from.setDate(from.getDate() - (365 * 2));
        break;
      case "5y":
        from.setDate(from.getDate() - (365 * 5));
        break;
      case "10y":
        from.setDate(from.getDate() - (365 * 10));
        break;
    }

  if (!ticker) {
    return res.status(400).json({ error: "Ticker symbol is required" });
  }

    try {
        // Fetch stock data from Financial Modeling Prep API
        const response = await fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?apikey=${API_KEY}&from=${from.toISOString().split('T')[0]}`);
        const stockData = await response.json();

    if (stockData.length === 0) {
      return res.status(404).json({ error: "Stock data not found" });
    }

    // Return the stock data directly as JSON
    res.status(200).json(stockData);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "An error occurred while retrieving stock data" });
  }
});


async function getPortfolioById(portfolioId) {
  try {
      const portfolioQuery = `
          SELECT 
              p.PORTFOLIO_ID, 
              p.NAME, 
              p.BALANCE, 
              p.USER_ID,
              ARRAY_AGG(sp.TICKER_SYMBOL) AS stocks
          FROM PORTFOLIOS p
          LEFT JOIN STOCKS_PORTFOLIOS sp ON p.PORTFOLIO_ID = sp.PORTFOLIO_ID
          WHERE p.PORTFOLIO_ID = $1
          GROUP BY p.PORTFOLIO_ID;
      `;

      const { rows } = await pool.query(portfolioQuery, [portfolioId]);

      if (rows.length === 0) { return null; }

      const portfolio = rows[0];

      return {
          id: portfolio.portfolio_id,
          name: portfolio.name,
          balance: portfolio.balance,
          userId: portfolio.user_id,
          stocks: portfolio.stocks || [],
      };
  } catch (error) {
      console.error("Error fetching portfolio:", error);
      throw error;
  }
}

app.listen(PORT, hostname, () => {
  console.log(`http://${hostname}:${PORT}`);
});
