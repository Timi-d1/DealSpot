import React from "react";
import styles from './Popup.module.css';

const Popup: React.FC<{ onClose: () => void, onTakeMeThere: () => void }> = ({ onClose, onTakeMeThere }) => {
  return (
    <div className={styles.popup}>
      <div className={styles.popupContent}>
        <h2 className={styles.popupTitle}>Access Denied</h2>
        <p className={styles.popupMessage}>You need to login/signup as a seller to access this page.</p>
        <div className={styles.buttonContainer}>
          <button className={styles.closeButton} onClick={onClose}>Close</button>
          <button className={styles.takeMeThereButton} onClick={onTakeMeThere}>Take me to the Signup page</button>
        </div>
      </div>
    </div>
  );
};

export default Popup;