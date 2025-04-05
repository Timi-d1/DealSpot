import React from 'react';
import styles from './Dashboard.module.css';

interface HeaderProps {
  logo: string;
}

const Header: React.FC<HeaderProps> = ({ logo}) => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>{logo}</div>
     
    </header>
  );
};

export default Header;