"use client";
import React, { useState } from "react";
import styles from "./InputDesign.module.css";
import Header from "./Header";
import ChatInterface from "./ChatInterface";
import Footer from "./Footer";
import { ChatProvider } from "./ChatContext";


function InputDesign() {
    const [searchQuery, setSearchQuery] = useState<string>(""); // Store search query
  
  
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <ChatProvider>
        <main className={styles.appContainer}>
        <Header setSearchQuery={setSearchQuery} /> {/* Pass setter function */}
          <hr className={styles.div} />
          <ChatInterface />
          <Footer />
        </main>
      </ChatProvider>
    </>
  );
}

export default InputDesign;