import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {

}

const ProgressBar: React.FC<ProgressBarProps> = () => {
  const steps = [
    { name: 'Categories', icon: '/images/image1.png' },
    { name: 'Photos', icon: '/images/image2.png' },
    { name: 'Description', icon: '/images/image3.png' },
    { name: 'Delivery', icon: '/images/image4.png' }
  ];

  return (
    <div className={styles.progressBar}>
      {steps.map((step, index) => (
        <React.Fragment key={step.name}>
          <div className={styles.step}>
            <img src={step.icon} alt="" className={styles.stepIcon} />
            <span className={styles.stepName}>{step.name}</span>
          </div>
          {index < steps.length - 1 && <div className={styles.separator} />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProgressBar;