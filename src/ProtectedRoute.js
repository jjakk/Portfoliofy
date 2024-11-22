import { Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

export const ProtectedRoute = ({ children }) => {
  const { authenticated } = useAuth();
  if (!authenticated) {
    // user is not authenticated
    return <Navigate to="/auth/login" />;
  }
  return children;
};