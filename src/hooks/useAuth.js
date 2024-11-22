import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";
import * as Api from "../axios/api";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useLocalStorage("authToken", null);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  const login = async (data) => {
    const { token } = await Api.login(data);
    console.log(token);
    setAuthToken(token);
    navigate("/portfolios");
  };

  const register = async (data) => {
    const { token } = await Api.register(data);
    console.log(token);
    setAuthToken(token);
    navigate("/portfolios");
  };

  // call this function to sign out logged in user
  const logout = async () => {
    await Api.logout();
    setAuthToken(null);
    navigate("/", { replace: true });
  };

  useEffect(() => {
    Api.getUser()
    .then(user => {
      setAuthenticated(!!user);
    })
    .catch(() => {
      setAuthenticated(false);
    });
  }, [authToken]);

  const value = useMemo(
    () => ({
      authToken,
      login,
      register,
      logout,
      authenticated,
    }),
    [authToken]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);