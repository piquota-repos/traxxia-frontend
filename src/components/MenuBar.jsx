import React, { useState, useEffect } from 'react';
import { Navbar, Container, Dropdown } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, CircleUserRound, Settings, Home } from 'lucide-react';

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
    <Navbar expand="lg" className="p-2 sticky-top modern-navbar">
      <Container fluid>
        <Navbar.Brand
          className="fw-bold logo-text order-1 order-lg-1"
          onClick={() => navigate('/dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <span className="text-gradient">Traxxia</span>
        </Navbar.Brand>

        <div
          className="d-flex align-items-center order-3 order-lg-2"
          style={{ marginTop: "10px" }}
        >
          <h5>{currentPage}</h5>
        </div>

        <div
          className="d-flex align-items-center order-2 order-lg-3"
          style={{ marginTop: "10px" }}
        >
          <Dropdown>
            <Dropdown.Toggle
              variant="link"
              id="dropdown-user"
              className="nav-profile-toggle"
            >
              <div className="avatar-circle">
                <CircleUserRound
                  size={25}
                  style={{ marginRight: "5px", marginBottom: "3px" }}
                />
                {userName?.toUpperCase() || 'USER'}
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu align="end" className="modern-dropdown">
              <Dropdown.Item
                onClick={handleDashboardClick}
                className={`dropdown-item-modern ${isCurrentPage('/dashboard') ? 'active bg-primary text-white' : ''}`}
              >
                <Home size={16} className="me-2" />
                Dashboard
              </Dropdown.Item>
              {isAdmin && (
                <Dropdown.Item
                  onClick={handleAdminClick}
                  className={`dropdown-item-modern ${isCurrentPage('/admin') ? 'active bg-primary text-white' : ''}`}
                >
                  <Settings size={16} className="me-2" />
                  Admin
                </Dropdown.Item>
              )}
              <Dropdown.Item
                onClick={handleLogout}
                className="dropdown-item-modern text-danger"
              >
                <LogOut size={16} className="me-2" />
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="ms-2" />
        </div>
      </Container>
    </Navbar>
  );
};

export default MenuBar;