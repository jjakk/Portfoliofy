import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <header className="container is-widescreen">
      <nav className="is-flex is-justify-content-space-between p-5">
        <h1 className="title">Portfoliofy</h1>
        <ul className="is-flex flex-direction-row gap-10">
          <li className="subtitle">
            <NavLink activeClassName="is-active" to="/">
              <button className="button">Home</button>
            </NavLink>
          </li>
          {
            user ? (
                <>
                    <li className="subtitle">
                        <NavLink activeClassName="is-active" to="/portfolios">
                          <button className="button">Portfolios</button>
                        </NavLink>
                    </li>
                    <li className="subtitle">
                        <button className="button" onClick={logout}>Logout</button>
                    </li>
                </>
            ) : (
                <>
                    <li className="subtitle">
                        <NavLink activeClassName="is-active" to="/auth/login">
                          <button className="button">Login</button>
                        </NavLink>
                    </li>
                    <li className="subtitle">
                        <NavLink activeClassName="is-active" to="/auth/register">
                          <button className="button">Register</button>
                        </NavLink>
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