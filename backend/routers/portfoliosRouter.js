const express = require("express");
const pool = require("../db/db");
const { getStockHistory } = require("../axios/api");
const portfoliosRouter = express.Router();

const requireAuth = require("../middleware/requireAuth");

const fetchStockDataFromDate = async (ticker, startDate) => {
  try {
    const stockData = getStockHistory({ ticker });

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

    return { ticker, historical: historicalMap };
  } catch (error) {
    console.error(`Error fetching data for stock ${ticker}:`, error);
    return { ticker, error: "Failed to fetch data" };
  }
};

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
          t.STOCKS_TICKER_SYMBOL AS ticker,
          MIN(t.TRANSACTION_DATE) AS purchase_date
      FROM PORTFOLIOS p
      LEFT JOIN TRANSACTIONS t ON p.PORTFOLIO_ID = t.PORTFOLIO_ID
      WHERE p.PORTFOLIO_ID = $1
      GROUP BY p.PORTFOLIO_ID, t.STOCKS_TICKER_SYMBOL;
    `;

    const { rows: portfolioData } = await pool.query(portfolioQuery, [portfolioId]);

    if (!portfolioData || portfolioData.length === 0) {
      return res.status(404).json({ error: "Portfolio not found or no transactions" });
    }

    const stocks = await Promise.all(
      portfolioData.map((stock) =>
        fetchStockDataFromDate(stock.ticker, stock.purchase_date)
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

portfoliosRouter.post('/', async (req, res) => {
  const { name, balance, user_id, transactions } = req.body;

  if (!name || !balance || !user_id) {
      return res.status(400).json({ error: 'Name, balance, and user_id are required.' });
  }

  if (transactions && !Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Transactions must be an array.' });
  }

  try {
      await pool.query('BEGIN');

      const insertPortfolioQuery = `
          INSERT INTO PORTFOLIOS (NAME, BALANCE, USER_ID)
          VALUES ($1, $2, $3)
          RETURNING *;
      `;
      const portfolioValues = [name, balance, user_id];
      const portfolioResult = await pool.query(insertPortfolioQuery, portfolioValues);
      const portfolioId = portfolioResult.rows[0].portfolio_id;

      if (transactions && transactions.length > 0) {
          const insertTransactionQuery = `
              INSERT INTO TRANSACTIONS (TOTAL_AMOUNT, QUANTITY, PRICE_PER_SHARE, TRANSACTION_DATE, TYPE_ID, STOCKS_TICKER_SYMBOL, PORTFOLIO_ID)
              VALUES ($1, $2, $3, $4, $5, $6, $7);
          `;

          for (const transaction of transactions) {
              const {
                  total_amount,
                  quantity,
                  price_per_share,
                  transaction_date,
                  type_id,
                  stocks_ticker_symbol,
              } = transaction;

              if (
                  !total_amount ||
                  !quantity ||
                  !price_per_share ||
                  !transaction_date ||
                  !type_id ||
                  !stocks_ticker_symbol
              ) {
                  throw new Error('Missing required fields in transactions.');
              }

              const transactionValues = [
                  total_amount,
                  quantity,
                  price_per_share,
                  transaction_date,
                  type_id,
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
  //The request body should have the stock(s) to add, quantity and timestamp of purchase (may not be current timestamp)
  const { tickerSymbol, quantity, pricePerShare, timestamp } = req.body;

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
  
  
portfoliosRouter.get("/currentStocks", requireAuth, async (req, res) => {
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

module.exports = portfoliosRouter;