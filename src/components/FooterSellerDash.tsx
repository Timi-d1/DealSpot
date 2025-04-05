import React from 'react';
import styles from './Dashboard.module.css';

interface FooterSection {
  title: string;
  items: string[];
}

interface FooterProps {
  sections: FooterSection[];
}

const Footer: React.FC<FooterProps> = ({ sections }) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {sections.map((section, index) => (
          <div key={index} className={styles.footerSection}>
            <h3 className={styles.footerTitle}>{section.title}</h3>
            {section.items.map((item, itemIndex) => (
              <p key={itemIndex} className={styles.footerText}>{item}</p>
            ))}
          </div>
        ))}
      </div>
    </footer>
  );
};

export default Footer;