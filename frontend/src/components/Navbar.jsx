import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          BRT<span>.</span>
        </Link>

        <ul className="navbar-nav">
          {user ? (
            <>
              <li>
                <Link
                  to="/"
                  className={`navbar-link ${isActive('/') ? 'active' : ''}`}
                >
                  Dashboard
                </Link>
              </li>
              {(user.role === 'ADMIN' || user.role === 'TESTER') && (
                <li>
                  <Link
                    to="/create-project"
                    className={`navbar-link ${isActive('/create-project') ? 'active' : ''}`}
                  >
                    + New Project
                  </Link>
                </li>
              )}
              <li>
                <Link
                  to="/report-bug"
                  className={`navbar-link ${isActive('/report-bug') ? 'active' : ''}`}
                >
                  + Report Case
                </Link>
              </li>
              <li style={{ marginLeft: '12px' }}>
                <span className="badge-pill-mono" style={{ borderColor: 'var(--stamp)', color: 'var(--stamp)' }}>
                  {user.name} ({user.role})
                </span>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="navbar-link"
                  style={{
                    background: 'none',
                    border: 'none',
                    fontFamily: 'inherit',
                    textDecoration: 'underline',
                    padding: 0
                  }}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className={`navbar-link ${isActive('/login') ? 'active' : ''}`}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className={`navbar-link ${isActive('/register') ? 'active' : ''}`}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};
