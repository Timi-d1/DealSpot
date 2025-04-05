import React from 'react';
import styles from './Dashboard.module.css';

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon}  data-testid="stat-icon">
        <div dangerouslySetInnerHTML={{ __html: icon }} />
      </div>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
    </div>
  );
};

export default StatCard;