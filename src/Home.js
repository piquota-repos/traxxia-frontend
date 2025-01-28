import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'reactstrap';

const Home = () => {
  return (
    <div>
      {/* Navbar */}
      <Navbar color="light" light expand="md">
        <Container>
          <h1 className="navbar-brand">Welcome to My App</h1>
          <Nav className="ms-auto" navbar>
            <Link to="/register" className="nav-link">
              Sign Up
            </Link>
            <Link to="/login" className="nav-link">
              Login
            </Link>
          </Nav>
        </Container>
      </Navbar>

      {/* Main Content */}
      <div className="container mt-5">
        <h2>Welcome to the User Authentication App</h2>
        <p>
          This application demonstrates user registration, login, and dashboard functionality using
          ReactJS, Node.js, Express, MySQL, and JWT.
        </p>
        <p>
          To get started, please <Link to="/register">Sign Up</Link> or <Link to="/login">Login</Link>.
        </p>
      </div>
    </div>
  );
};

export default Home;
