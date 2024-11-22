import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

const Layout = () => {
  const { authenticated, logout } = useAuth();

  return (
    <header className="container is-widescreen">
      <nav className="is-flex is-justify-content-space-between p-5">
        <h1 className="title">Portfoliofy</h1>
        <ul className="is-flex flex-direction-row gap-10">
          <li className="subtitle">
            <NavLink className={({ isActive }) => "button " + (isActive ? "is-active" : "")} to="/">
              Home
            </NavLink>
          </li>
          {
            authenticated ? (
                <>
                    <li className="subtitle">
                        <NavLink className={({ isActive }) => "button " + (isActive ? "is-active" : "")} to="/portfolios">
                         Portfolios
                        </NavLink>
                    </li>
                    <li className="subtitle">
                        <button className="button" onClick={logout}>Logout</button>
                    </li>
                </>
            ) : (
                <>
                    <li className="subtitle">
                        <NavLink className={({ isActive }) => "button " + (isActive ? "is-active" : "")} to="/auth/login">
                         Login
                        </NavLink>
                    </li>
                    <li className="subtitle">
                        <NavLink className={({ isActive }) => "button " + (isActive ? "is-active" : "")} to="/auth/register">
                         Register
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