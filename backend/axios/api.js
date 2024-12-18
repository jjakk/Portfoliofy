const axios = require("axios");
let API_KEY = process.env.API_KEY;

const apiInstance = axios.create({
    baseURL: "https://financialmodelingprep.com/api/v3",
});

const getStockHistory = async ({ ticker, startDate }) => {
    let queryURL = `/historical-price-full/${ticker}?apikey=${API_KEY}`;
    if(startDate)
        queryURL += `&from=${startDate.toISOString().split('T')[0]}`;

    const response = await apiInstance.get(queryURL);
    // console.log(response);
    const { data } = response;
    return data;
};

module.exports = {
    getStockHistory
};