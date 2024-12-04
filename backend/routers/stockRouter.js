const express = require("express");
let env = require("../env.json");
let API_KEY = env["api-key"];
const stockRouter = express.Router();
const { getStartDateFromTimeframe } = require("../helpers");
const { getStockHistory } = require("../axios/api");

stockRouter.get("/:ticker", async (req, res) => {
  try {
    const { ticker } = req.params;
    const { timeframe, date } = req.query;
    let startDate;
    if(timeframe) {
      startDate = getStartDateFromTimeframe(timeframe);
    }

    if (!ticker)
      return res.status(400).json({ error: "Ticker symbol is required" });

    const stockData = await getStockHistory({ ticker, startDate });

    if (stockData.length === 0)
      return res.json({ ticker, date, closeValue: null });

    // If a date is provided, only return the stock price at that given date
    if(date) {
      const stockOnDate = stockData.historical.find(record => record.date === date);
      if (!stockOnDate)
        return res.json({ ticker, date, closeValue: null });

      res.status(200).json({ ticker, date, closeValue: stockOnDate.close });
    }
    // Otherwise return all price history
    else{
      res.status(200).json(stockData);
    }

  }
  catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "An error occurred while retrieving stock data" });
  }
});

module.exports = stockRouter;