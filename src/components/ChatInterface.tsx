import React from "react";
import styles from "./ChatInterface.module.css";
import PeopleSection from "./PeopleSection";
import ChatSection from "./ChatSection";

const ChatInterface: React.FC = () => {
  return (
    <section className={styles.mainContent}>
      <PeopleSection />
      <ChatSection />
    </section>
  );
};

export default ChatInterface;