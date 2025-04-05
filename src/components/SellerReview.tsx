"use client";
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom"; // Correct import for React Router
import styles from "./SellerReview.module.css";
import Header from "./Header";
import ReviewContent from "./ReviewContent"; // Ensure the file 'ReviewContent.tsx' exists in the same folder
import Footer from "./Footer";

const SellerReview: React.FC = () => {
  const [searchParams] = useSearchParams(); // Correct destructuring
  const sellerId = searchParams.get("sellerId") || "unknown-seller"; // Extract sellerId from URL
  const [searchQuery, setSearchQuery] = useState<string>(""); // Store search query
  
  

  return (
    <main className={styles.sellerReview}>
      <Header setSearchQuery={setSearchQuery} /> {/* Pass setter function */}
      <hr className={styles.div6} />
      <ReviewContent sellerId={sellerId} /> {/* Pass sellerId to ReviewContent */}
      <Footer />
    </main>
  );
};

export default SellerReview;