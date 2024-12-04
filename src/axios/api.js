import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000"
});
api.interceptors.request.use(
    config => {
        const authToken = localStorage.getItem('authToken');
        if(authToken) {
            config.headers['authorization'] = `Bearer ${authToken.replaceAll('"', '')}`;
        }
          return config;
      },
      error => {
          return Promise.reject(error);
      }
);

export const getUser = async () => {
    const { data } = await api.get("/");
    return data;
};

export const login = async ({ username, password }) => {
    const { data } = await api.post("/auth/login", { username, password });
    return data;
};

export const logout = async () => {
    await api.post("/auth/logout");
};

export const register = async ({ username, password }) => {
    const { data } = await api.post("/auth/register", { username, password });
    return data;
};

export const getStockData = async ({ ticker, timeframe }) => {
    const { data } = await api.get(`/stock/${ticker}?timeframe=${timeframe}`);
    return data;
};

export const getHistoricalStockPrice = async ({ ticker, date }) => {
    const { data } = await api.get(`/stock/${ticker}?date=${date}`);
    return data;
};

export const getPortfolioData = async ({ name }) => {
    const { data } = await api.get(`/currentStocks?userId=null&portfolioId=null`);
    return data;
};

export const postPortfolio = async ({ name, balance, transactions }) => {
    console.log({
        name,
        balance,
        transactions
    });
    await api.post("portfolios", { name, balance, transactions });
};