const axios = require("axios");
let env = require("../env.json");
let API_KEY = env["api-key"];

const apiInstance = axios.create({
    baseURL: "https://financialmodelingprep.com/api/v3",
});

const getStockHistory = async ({ ticker, startDate }) => {
    let queryURL = `/historical-price-full/${ticker}?apikey=${API_KEY}`;
    if(startDate)
        queryURL += `&from=${startDate.toISOString().split('T')[0]}`;

    console.log(queryURL);
    const response = await apiInstance.get(queryURL);
    // console.log(response);
    const { data } = response;
    return data;
};

module.exports = {
    getStockHistory
};