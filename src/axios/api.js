import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000"
});

export const login = async ({ username, password }) => {
    const { data } = await api.post("/auth/login", { username, password });
    return data;
};

export const register = async ({ username, password }) => {
    const { data } = await api.post("/auth/register", { username, password });
    return data;
};

export const getStockData = async ({ ticker, timeframe }) => {
    const { data } = await api.get(`/stocks?ticker=${ticker}&timeframe=${timeframe}`);
    return data;
};

export const getPortfolioData = async ({ name }) => {
    const { data } = await api.get(`/currentStocks?userId=null&portfolioId=null`);
    return data;
};