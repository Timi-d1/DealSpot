import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

const Sidebar: React.FC<{ isVisible: boolean; onClose: () => void }> = ({ isVisible, onClose }) => {
  const navigate = useNavigate();

  return (
    <div className={`${styles.sidebar} ${isVisible ? styles.sidebarOpen : ''}`}>
      <div className={styles.sidebarContent}>
        <div className={styles.menuItem} onClick={() => navigate('/homepage')}>
          Main Page
        </div>
        <div className={styles.menuItem} onClick={() => navigate('/add-listing')}>
          Add Listing
        </div>
        <div className={styles.menuItem} onClick={() => navigate('/message')}>
          Chats
        </div>
      </div>
    </div>
  );
};

export default Sidebar;