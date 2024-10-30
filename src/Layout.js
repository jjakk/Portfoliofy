import { Outlet, Link } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <header className="container is-widescreen">
      <nav className="is-flex is-justify-content-space-between p-5">
        <h1 className="title">Portfoliofy</h1>
        <ul className="is-flex flex-direction-row gap-10">
          <li className="subtitle">
            <Link to="/">
                <button className="button">Home</button>
            </Link>
          </li>
          {
            user ? (
                <>
                    <li className="subtitle">
                        <Link to="/portfolios">
                            <button className="button">Portfolios</button>
                        </Link>
                    </li>
                    <li className="subtitle">
                        <button className="button" onClick={logout}>Logout</button>
                    </li>
                </>
            ) : (
                <>
                    <li className="subtitle">
                        <Link to="/auth/login">
                            <button className="button">Login</button>
                        </Link>
                    </li>
                    <li className="subtitle">
                        <Link to="/auth/register">
                            <button className="button">Register</button>
                        </Link>
                    </li>
                </>
            )
        }
        </ul>
      </nav>

      <Outlet />
    </header>
  )
};

export default Layout;