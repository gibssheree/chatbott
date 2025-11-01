import React from 'react';
import { Nav, Navbar, Container } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { FiHome, FiUser, FiInfo } from 'react-icons/fi';

const NavTabs = () => {
  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container fluid>
        <Navbar.Brand className="fw-bold text-primary">
          <FiUser className="me-2" />
          Hermes AI
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" className="d-flex align-items-center">
              <FiHome className="me-1" />
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/contact" className="d-flex align-items-center">
              <FiUser className="me-1" />
              Contact
            </Nav.Link>
            <Nav.Link as={NavLink} to="/about" className="d-flex align-items-center">
              <FiInfo className="me-1" />
              About
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavTabs;
