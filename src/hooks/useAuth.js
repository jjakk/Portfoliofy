import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";
import Api from "../axios/api";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useLocalStorage("authToken", null);
  const navigate = useNavigate();

  // call this function when you want to authenticate the user
  const login = async (data) => {
    const { token } = await Api.login(data);
    setAuthToken(token);
    navigate("/portfolios");
  };

  // call this function to sign out logged in user
  const logout = () => {
    setAuthToken(null);
    navigate("/", { replace: true });
  };

  const value = useMemo(
    () => ({
      authToken,
      login,
      logout,
    }),
    [authToken]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);