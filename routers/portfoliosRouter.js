const express = require("express");
const pool = require("../db/db");
const { getStockHistory } = require("../axios/api");
const portfoliosRouter = express.Router();

const requireAuth = require("../middleware/requireAuth");

const fetchStockDataFromDate = async (ticker, startDate, quantity=null) => {
  try {
    const stockData = await getStockHistory({ ticker });

    if (!stockData || !stockData.historical) {
      throw new Error(`No historical data for stock: ${ticker}`);
    }

    const filteredHistorical = stockData.historical.filter(
      (record) => new Date(record.date) >= new Date(startDate)
    );

    const historicalMap = filteredHistorical.reduce((map, record) => {
      map[record.date] = record.close;
      return map;
    }, {});

    return { ticker, quantity, historical: historicalMap };
  } catch (error) {
    console.error(`Error fetching data for stock ${ticker}:`, error);
    return { ticker, error: "Failed to fetch data" };
  }
};

portfoliosRouter.get("/", async (req, res) => {
  try {
    const portfolioQuery = `
      SELECT * FROM PORTFOLIOS;
    `;

    const { rows: portfolioData } = await pool.query(portfolioQuery, []);

    res.status(200).json(portfolioData);
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    res.status(500).json({ error: "An error occurred while retrieving portfolio data" });
  }
});

portfoliosRouter.get("/:portfolioId", async (req, res) => {
  const { portfolioId } = req.params;
  if (!portfolioId) {
    return res.status(400).json({ error: "Portfolio ID is required" });
  }

  try {
    const portfolioQuery = `
      SELECT 
          p.PORTFOLIO_ID, 
          p.NAME, 
          p.BALANCE, 
          p.USER_ID,
          t.QUANTITY,
          t.STOCKS_TICKER_SYMBOL AS ticker,
          MIN(t.TRANSACTION_DATE) AS purchase_date
      FROM PORTFOLIOS p
      LEFT JOIN TRANSACTIONS t ON p.PORTFOLIO_ID = t.PORTFOLIO_ID
      WHERE p.PORTFOLIO_ID = $1
      GROUP BY p.PORTFOLIO_ID, t.QUANTITY, t.STOCKS_TICKER_SYMBOL;
    `;

    const { rows: portfolioData } = await pool.query(portfolioQuery, [portfolioId]);

    if (!portfolioData || portfolioData.length === 0) {
      return res.status(404).json({ error: "Portfolio not found or no transactions" });
    }

    const stocks = await Promise.all(
      portfolioData.map((stock) => 
        fetchStockDataFromDate(stock.ticker, stock.purchase_date, stock.quantity)
      )
    );

    res.status(200).json({
      portfolioId,
      name: portfolioData[0].name,
      balance: portfolioData[0].balance,
      userId: portfolioData[0].user_id,
      stocks,
    });
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    res.status(500).json({ error: "An error occurred while retrieving portfolio data" });
  }
});

portfoliosRouter.post('/', requireAuth, async (req, res) => {
  const { name, balance, transactions } = req.body;

  if (!name || !balance) {
      return res.status(400).json({ error: 'Name, & balance, are required.' });
  }

  if (transactions && !Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Transactions must be an array.' });
  }

  if (transactions && transactions.length > 0) {
    const totalTransactionAmount = transactions.reduce((total, transaction) => {
      if (!transaction.total_amount) {
        throw new Error('Each transaction must include a total_amount field.');
      }
      return total + transaction.total_amount;
    }, 0);

    // Validate the total transaction amount
    if (totalTransactionAmount > 10000) {
      return res.status(400).json({
        error: `Total transaction amount exceeds the limit of 10000. Current total is ${totalTransactionAmount}.`,
      });
    }
  }

  try {
      await pool.query('BEGIN');

      const insertPortfolioQuery = `
          INSERT INTO PORTFOLIOS (NAME, BALANCE, USER_ID)
          VALUES ($1, $2, $3)
          RETURNING *;
      `;
      const portfolioValues = [name, balance, req.user.user_id];
      const portfolioResult = await pool.query(insertPortfolioQuery, portfolioValues);
      const portfolioId = portfolioResult.rows[0].portfolio_id;

      if (transactions && transactions.length > 0) {
          const insertTransactionQuery = `
              INSERT INTO TRANSACTIONS (TOTAL_AMOUNT, QUANTITY, PRICE_PER_SHARE, TRANSACTION_DATE, STOCKS_TICKER_SYMBOL, PORTFOLIO_ID)
              VALUES ($1, $2, $3, $4, $5, $6);
          `;

          for (const transaction of transactions) {
              const {
                  total_amount,
                  quantity,
                  price_per_share,
                  transaction_date,
                  stocks_ticker_symbol,
              } = transaction;

              if (
                  !total_amount ||
                  !quantity ||
                  !price_per_share ||
                  !transaction_date ||
                  !stocks_ticker_symbol
              ) {
                  throw new Error('Missing required fields in transactions.');
              }

              const transactionValues = [
                  total_amount,
                  quantity,
                  price_per_share,
                  transaction_date,
                  stocks_ticker_symbol,
                  portfolioId,
              ];

              await pool.query(insertTransactionQuery, transactionValues);
          }
      }

      await pool.query('COMMIT');

      res.status(200).json({
          message: 'Portfolio created successfully.',
      });
  } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error creating portfolio and transactions:', error.message);
      res.status(500).json({ error: 'Failed to create portfolio and transactions.' });
  }
});

portfoliosRouter.post("/:portfolioId/addStock", requireAuth, async (req, res) => {
  const { portfolioId } = req.params;
  const { tickerSymbol, quantity, pricePerShare, timestamp } = req.body;

  // Check if all parameters are defined
  if (!tickerSymbol || !portfolioId || !quantity || !pricePerShare) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const transactionDate = timestamp;

  try {
    // Fetch the portfolio balance
    const portfolioQuery = `
      SELECT BALANCE 
      FROM PORTFOLIOS
      WHERE PORTFOLIO_ID = $1;
    `;
    const portfolioResult = await pool.query(portfolioQuery, [portfolioId]);

    if (portfolioResult.rowCount === 0) {
      return res.status(404).json({ error: "Portfolio not found" });
    }

    const currentBalance = portfolioResult.rows[0].balance;

    // Calculate the total amount for the transaction
    const totalAmount = quantity * pricePerShare;

    // Validate if the portfolio has enough balance
    if (totalAmount > currentBalance) {
      return res.status(400).json({
        error: `Insufficient balance. Portfolio balance is ${currentBalance}, but the transaction requires ${totalAmount}.`,
      });
    }

    // Check if the stock exists in the STOCKS table
    const stockCheck = await pool.query(
      "SELECT * FROM STOCKS WHERE TICKER_SYMBOL = $1",
      [tickerSymbol]
    );

    if (stockCheck.rowCount === 0) {
      // If the stock doesn't exist, insert it (assuming stockName is provided elsewhere)
      const stockName = tickerSymbol; // Default to the ticker symbol if name is unknown
      await pool.query(
        "INSERT INTO STOCKS (TICKER_SYMBOL, NAME) VALUES ($1, $2)",
        [tickerSymbol, stockName]
      );
    }

    // Start a transaction block
    await pool.query("BEGIN");

    // Insert the transaction into the TRANSACTIONS table
    await pool.query(
      `INSERT INTO TRANSACTIONS (TOTAL_AMOUNT, QUANTITY, PRICE_PER_SHARE, TRANSACTION_DATE, STOCKS_TICKER_SYMBOL, PORTFOLIO_ID) 
        VALUES ($1, $2, $3, $4, $5, $6)`,
      [totalAmount, quantity, pricePerShare, transactionDate, tickerSymbol, portfolioId]
    );

    // Deduct the total amount from the portfolio balance
    const updateBalanceQuery = `
      UPDATE PORTFOLIOS
      SET BALANCE = BALANCE - $1
      WHERE PORTFOLIO_ID = $2;
    `;
    await pool.query(updateBalanceQuery, [totalAmount, portfolioId]);

    // Commit the transaction block
    await pool.query("COMMIT");

    res.status(200).json({ message: "Stock added successfully and balance updated" });
  } catch (error) {
    // Rollback on error
    await pool.query("ROLLBACK");
    console.error("Error adding stock:", error);
    res.status(500).json({ error: "An error occurred while adding the stock" });
  }
});


portfoliosRouter.post("/:portfolioId/sellStock", requireAuth, async (req, res) => {
  const { portfolioId } = req.params;
  const { tickerSymbol, quantity, pricePerShare, timestamp } = req.body;

  // Check if all required fields are provided
  if (!tickerSymbol || !portfolioId || !quantity || !pricePerShare) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (quantity <= 0) {
    return res.status(400).json({ error: "Quantity must be a positive number." });
  }

  try {
    // Fetch the user's current stock holdings
    const stockHoldingsQuery = `
      SELECT COALESCE(SUM(QUANTITY), 0) AS total_quantity
      FROM TRANSACTIONS
      WHERE PORTFOLIO_ID = $1 AND STOCKS_TICKER_SYMBOL = $2;
    `;
    const { rows } = await pool.query(stockHoldingsQuery, [portfolioId, tickerSymbol]);
    const totalOwnedQuantity = rows[0]?.total_quantity || 0;

    // Validate if the user has enough stocks to sell
    if (quantity > totalOwnedQuantity) {
      return res
        .status(400)
        .json({ error: `Insufficient stocks. You only own ${totalOwnedQuantity} shares of ${tickerSymbol}.` });
    }

    // Prepare transaction details
    const transactionDate = timestamp || new Date();
    const negativePricePerShare = -Math.abs(pricePerShare); // Ensure price per share is negative
    const totalAmount = Math.abs(quantity * pricePerShare); // Selling increases balance, so totalAmount is positive

    // Start a transaction block
    await pool.query("BEGIN");

    // Insert the sell transaction
    await pool.query(
      `INSERT INTO TRANSACTIONS (TOTAL_AMOUNT, QUANTITY, PRICE_PER_SHARE, TRANSACTION_DATE, STOCKS_TICKER_SYMBOL, PORTFOLIO_ID)
        VALUES ($1, $2, $3, $4, $5, $6)`,
      [totalAmount, -quantity, negativePricePerShare, transactionDate, tickerSymbol, portfolioId]
    );

    // Update the portfolio balance
    const updateBalanceQuery = `
      UPDATE PORTFOLIOS
      SET BALANCE = BALANCE + $1
      WHERE PORTFOLIO_ID = $2;
    `;
    await pool.query(updateBalanceQuery, [totalAmount, portfolioId]);

    // Commit the transaction block
    await pool.query("COMMIT");

    res.status(200).json({ message: "Stock sold successfully and balance updated" });
  } catch (error) {
    // Rollback on error
    await pool.query("ROLLBACK");
    console.error("Error selling stock:", error);
    res.status(500).json({ error: "An error occurred while selling the stock" });
  }
});
  
portfoliosRouter.get("/:porfolioId/currentStocks", requireAuth, async (req, res) => {
  const { portfolioId } = req.params;
  const { userId } = req.query;
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

module.exports = portfoliosRouter;