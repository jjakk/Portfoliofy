import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000"
});

const login = async ({ username, password }) => {
    const { data } = await api.post("/auth/login", { username, password });
    return data;
};

export default {
    login
};