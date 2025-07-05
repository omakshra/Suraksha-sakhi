// /src/components/Navbar.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './navbar.css'; // optional, for separate styling

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-title">
        <h2>Suraksha sakhi</h2>
      </div>
      <ul className="navbar-links">
        <li className={location.pathname === '/' ? 'active' : ''}>
          <Link to="/">Home</Link>
        </li>
        <li className={location.pathname === '/chatbot' ? 'active' : ''}>
          <Link to="/chatbot">AI Chatbot Advisor</Link>
        </li>
        <li className={location.pathname === '/budgetplanner' ? 'active' : ''}>
          <Link to="/budgetplanner">Budget Planner</Link>
        </li>
        <li className={location.pathname === '/documenttranscriber' ? 'active' : ''}>
          <Link to="/documenttranscriber">Document Transcriber</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
