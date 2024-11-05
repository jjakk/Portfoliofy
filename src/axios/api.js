import axios from "axios";

const login = async ({ username, password }) => {
    const response = await axios.post("/login", { username, password });
    console.log(response);
};

export default {
    login
};