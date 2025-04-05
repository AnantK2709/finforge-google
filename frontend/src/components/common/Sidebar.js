import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Sidebar.css';

const Sidebar = ({ interfaceType }) => {
  const location = useLocation();
  
  const internalLinks = [
    { path: '/internal/dashboard', icon: 'fas fa-chart-line', label: 'Dashboard' },
    { path: '/internal/client-insights', icon: 'fas fa-users', label: 'Client Insights' },
    { path: '/internal/portfolio-risk', icon: 'fas fa-briefcase', label: 'Portfolio & Risk' },
    { path: '/internal/liquidity', icon: 'fas fa-water', label: 'Liquidity Intelligence' },
  ];
  
  const externalLinks = [
    { path: '/external/dashboard', icon: 'fas fa-home', label: 'Dashboard' },
    { path: '/external/portfolio-risk', icon: 'fas fa-chart-pie', label: 'My Portfolio & Risk' },
    { path: '/external/strategy-planner', icon: 'fas fa-chess', label: 'Smart Strategy Planner' },
    { path: '/external/behavior', icon: 'fas fa-brain', label: 'My Behavior' },
  ];
  
  const links = interfaceType === 'internal' ? internalLinks : externalLinks;
  
  const variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };
  
  return (
    <motion.aside 
      className={`sidebar ${interfaceType === 'internal' ? 'internal' : 'external'}`}
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="sidebar-top">
        <motion.div 
          className="ai-assistant-icon"
          whileHover={{ scale: 1.05 }}
        >
          <i className="fas fa-robot"></i>
          <span>AI Assistant</span>
        </motion.div>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {links.map((link, index) => (
            <motion.li 
              key={link.path}
              variants={variants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
            >
              <NavLink 
                to={link.path} 
                className={({ isActive }) => isActive ? 'active' : ''}
                end
              >
                <i className={link.icon}></i>
                <span>{link.label}</span>
                {link.path === location.pathname && (
                  <motion.div 
                    className="active-indicator"
                    layoutId="activeIndicator"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-bottom">
        <div className="sidebar-help">
          <i className="fas fa-question-circle"></i>
          <span>Help & Resources</span>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;