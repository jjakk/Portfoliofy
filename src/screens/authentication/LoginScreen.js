import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const onLogin = async (e) => {
    e.preventDefault();
    try {
      await login({ username, password });
    }
    catch(err) {
      setError(err?.response?.data || err.toString());
    }
  };
  
  return (
    <div>
      <h2 className="title">Login</h2>
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
        <button type="submit" className="button">Login</button>
        <span>Don't have an account? <Link to="../register">Create one</Link></span>
        {error && (
          <span className="has-text-danger">{error}</span>
        )}
      </form>
    </div>
  );
};

export default LoginScreen;
