import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const RegisterScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();

  const onRegister = async (e) => {
    e.preventDefault();
    if(password !== confirmPassword) {
        setError("Passwords must match");
    }
    else {
        await register({ username, password });
    }
  };
  
  return (
    <div>
      <h2 className="title">Register</h2>
      <form
        onSubmit={onRegister}
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
        <label htmlFor="password">Confirm Password</label>
        <input
          name="password"
          type="password"
          className="input"
          value={confirmPassword}
          onChange={event => setConfirmPassword(event.target.value)}
        />
        <button type="submit" className="button">Register</button>
        <span>Already have an account? <Link to="../login">Login</Link></span>
        <span className="has-text-danger">{ error }</span>
      </form>
    </div>
  );
};

export default RegisterScreen;
