import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ interfaceType }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      className={`navbar ${scrolled ? 'scrolled' : ''} ${interfaceType === 'internal' ? 'internal' : 'external'}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-container">
        <Link to="/" className="logo">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="fin">Fin</span>
            <span className="sentient">Sentient</span>
            {interfaceType === 'internal' && <span className="portal-badge">Advisor Portal</span>}
          </motion.div>
        </Link>

        <div className="nav-actions">
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
            <i className="fas fa-search"></i>
          </div>

          <div className="nav-icons">
            <motion.div 
              className="icon-container"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <i className="fas fa-bell"></i>
              <span className="notification-badge">3</span>
            </motion.div>
            
            <motion.div 
              className="icon-container"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <i className="fas fa-cog"></i>
            </motion.div>
            
            <motion.div 
              className="profile-icon"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="profile-initial">
                {interfaceType === 'internal' ? 'A' : 'C'}
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;