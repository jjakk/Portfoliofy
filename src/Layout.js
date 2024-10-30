import { Outlet, Link } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

const Layout = () => {
  const { user } = useAuth();

  return (
    <div>
      <nav className="container is-widescreen is-flex is-justify-content-space-between p-5">
        <h1 className="title">Portfoliofy</h1>
        <ul className="is-flex flex-direction-row gap-10">
          <li className="subtitle">
            <Link to="/">Home</Link> | 
          </li>
          {user && (
            <li className="subtitle">
                <Link to="/portfolios">Portfolios</Link>  | 
            </li>
          )}
          <li className="subtitle">
            <Link to="/auth/login">Login</Link> | 
          </li>
          <li className="subtitle">
            <Link to="/auth/register">Register</Link>
          </li>
        </ul>
      </nav>

      <Outlet />
    </div>
  )
};

export default Layout;