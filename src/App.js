import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./Layout";
import HomeScreen from "./screens/other/HomeScreen";
import PortfoliosScreen from "./screens/other/PortfoliosScreen";
import LoginScreen from "./screens/authentication/LoginScreen";
import RegisterScreen from "./screens/authentication/RegisterScreen";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomeScreen />} />
            <Route path="portfolios" element={<ProtectedRoute><PortfoliosScreen /></ProtectedRoute>} />
            <Route path="auth">
              <Route path="login" element={<LoginScreen />} />
              <Route path="register" element={<RegisterScreen />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
