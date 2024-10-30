import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const onLogin = async (e) => {
    e.preventDefault();
    await login({ username, password });
  };
  
  return (
    <div>
      <h2 className="subtitle">Sign In</h2>
      <form
        onSubmit={onLogin}
        className="is-flex is-flex-direction-column is-align-items-flex-start gap-10"
      >
        <label htmlFor="username">Username</label>
        <input
          name="username"
          type="text"
          className="input"
          value={username}
          onChange={event => setUsername(event.target.value)}
        />
        <label htmlFor="password">Password</label>
        <input
          name="password"
          type="password"
          className="input"
          value={password}
          onChange={event => setPassword(event.target.value)}
        />
        <button type="submit" className="button">Sign In</button>
      </form>
    </div>
  );
};

export default LoginScreen;
