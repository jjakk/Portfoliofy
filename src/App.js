import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import HomeScreen from "./screens/home/HomeScreen";
import SignInScreen from "./screens/authentication/SignInScreen";
import SignUpScreen from "./screens/authentication/SignUpScreen";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomeScreen />} />
          <Route path="auth">
            <Route path="sign-in" element={<SignInScreen />} />
            <Route path="sign-up" element={<SignUpScreen />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
