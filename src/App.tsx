import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AddListing from "./components/AddListing";
import ECommerceHomePage from "./components/ECommerceHomePage";
import SavedListings from "./components/SavedListings"; // Import the new page
import Dashboard from "./components/Dashboard";
import NewItemsSection from "./components/NewItemsSection";
import InputDesign from "./components/InputDesign";
import EditListing from "./components/EditListing";
import SellerReview from "./components/SellerReview";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} /> {/* Role Selection Page */}
        <Route path="/login" element={<Login />} /> {/* Login Page */}
        <Route path="/signup" element={<Signup />} /> {/* Signup Page */}
        <Route path="/homepage" element={<ECommerceHomePage />} /> {/* Homepage Page */}
        <Route path="/add-listing" element={<AddListing />} /> {/* Listing Page */}
        <Route path="/saved-listings" element={<SavedListings />}  />
        <Route path="/dashboard" element={<Dashboard />} /> {/*Seller Dashboard */}
        <Route path="/" element={<NewItemsSection />} /> {/* Seller ID */}
        <Route path="/message" element={<InputDesign />} /> {/* Message Page */}
        <Route path="/review" element={<SellerReview />} /> {/* Seller Review Page */}
        <Route path="/edit-listing/:listingId" element={<EditListing />} /> {/* Edit Listing Page */}
      </Routes>
    </Router>
  );
};

export default App;
