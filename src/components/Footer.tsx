import React, { useState } from "react";
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Support</h3>
            <ul className={styles.sectionList}>
              <li>Toronto, ON</li>
              <li>dealspot@gmail.com</li>
            </ul>
        </div>
        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Account</h3>
          <ul className={`${styles.sectionList} ${styles.navLinks}`}>
            <li><a href="/account" className={styles.navLink}>Account</a></li>
            <li><a href="/" className={styles.navLink}>Logout</a></li>
            <li><a href="/cart" className={styles.navLink}>Cart</a></li>
            <li><a href="/wishlist" className={styles.navLink}>Wishlist</a></li>
          </ul>
        </div>
        <div className={styles.footerSection}>
        <h3 className={styles.sectionTitle}>Quick Links</h3>
          <ul className={`${styles.sectionList} ${styles.navLinks}`}>
            <li><a href="/privacypolicy" className={styles.navLink}>Privacy Polcy</a></li>
            <li><a href="/termsofuse" className={styles.navLink}>Terms of Use</a></li>
            <li><a href="/faq" className={styles.navLink}>FAQ</a></li>
            <li><a href="/contact" className={styles.navLink}>Contact</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;