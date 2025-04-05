import React from 'react';
import { motion } from 'framer-motion';
import './SwitchInterface.css';

const SwitchInterface = ({ interfaceType, onSwitch }) => {
  return (
    <motion.div 
      className="switch-interface"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="switch-label">
        {interfaceType === 'internal' 
          ? 'Advisor Portal' 
          : 'Client Portal'}
      </div>
      
      <motion.button 
        className="switch-button"
        onClick={onSwitch}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>Switch to {interfaceType === 'internal' ? 'Client' : 'Advisor'} View</span>
        <i className="fas fa-exchange-alt"></i>
      </motion.button>
    </motion.div>
  );
};

export default SwitchInterface;