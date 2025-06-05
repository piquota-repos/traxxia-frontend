import React, { useState, useEffect } from 'react';
import { Navbar, Container, Dropdown } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, CircleUserRound, Settings, Home, Menu, User } from 'lucide-react';
import "../styles/menubar.css"; 
const MenuBar = ({ currentPage = "DASHBOARD" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    // Check if user is admin from sessionStorage
    const isAdminStored = sessionStorage.getItem('isAdmin');
    const userNameStored = sessionStorage.getItem('userName');

    setIsAdmin(isAdminStored === 'true');
    setUserName(userNameStored || 'User');
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  // Check if current page is active
  const isCurrentPage = (path) => {
    return location.pathname === path;
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <Navbar className="traxia-navbar p-0">
      <Container fluid className="px-3 py-2">
        <div className="d-flex align-items-center justify-content-between w-100">
          {/* Left: Hamburger Menu */}
          {/* <div className="navbar-left">
            <Dropdown>
              <Dropdown.Toggle
                variant="link"
                id="dropdown-menu"
                className="hamburger-menu p-0 border-0 shadow-none"
              >
                <Menu size={20} className="text-dark" />
              </Dropdown.Toggle>
              <Dropdown.Menu align="start" className="traxia-dropdown">
                <Dropdown.Item
                  onClick={handleDashboardClick}
                  className={`dropdown-item-traxia ${isCurrentPage('/dashboard') ? 'active' : ''}`}
                >
                  <Home size={16} className="me-2" />
                  Dashboard
                </Dropdown.Item>
                {isAdmin && (
                  <Dropdown.Item
                    onClick={handleAdminClick}
                    className={`dropdown-item-traxia ${isCurrentPage('/admin') ? 'active' : ''}`}
                  >
                    <Settings size={16} className="me-2" />
                    Admin
                  </Dropdown.Item>
                )}
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={handleLogout}
                  className="dropdown-item-traxia text-danger"
                >
                  <LogOut size={16} className="me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div> */}

          <div className="navbar-center">
            <Navbar.Brand
              className="traxia-logo"
              onClick={() => navigate('/dashboard')}
              style={{ cursor: 'pointer' }}
            >
              <img
               src="/traxxia-logo.png"
                alt="Traxia Logo"
                style={{ height: '24px' }} // Adjust as needed
              />
            </Navbar.Brand>

          </div>

          <div className="navbar-right">
            <Dropdown>
              <Dropdown.Toggle
                variant="link"
                id="dropdown-user"
                className="user-menu p-0 border-0 shadow-none"
              >
                <User size={20} className="text-dark" />
              </Dropdown.Toggle>
              <Dropdown.Menu align="end" className="traxia-dropdown">
                <Dropdown.Header className="text-muted small">
                  Signed in as <strong>{userName}</strong>
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={handleDashboardClick}
                  className={`dropdown-item-traxia ${isCurrentPage('/dashboard') ? 'active' : ''}`}
                >
                  <Home size={16} className="me-2" />
                  Dashboard
                </Dropdown.Item>
                {isAdmin && (
                  <Dropdown.Item
                    onClick={handleAdminClick}
                    className={`dropdown-item-traxia ${isCurrentPage('/admin') ? 'active' : ''}`}
                  >
                    <Settings size={16} className="me-2" />
                    Admin
                  </Dropdown.Item>
                )}
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={handleLogout}
                  className="dropdown-item-traxia text-danger"
                >
                  <LogOut size={16} className="me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </Container>
    </Navbar>
  );
};

export default MenuBar;