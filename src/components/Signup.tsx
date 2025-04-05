import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./Signup.css";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

const Signup: React.FC = () => {
  const navigate = useNavigate(); 
  const location = useLocation();
  const role = location.state?.role || "buyer";

  // State for form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: ""
  });

  const [error, setError] = useState(""); 

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic form validation
    if (!formData.name || !formData.email || !formData.password || !formData.location) {
      setError("All fields are required.");
      return;
    }

    try {
      // Call backend API (port 5001)
      const response = await fetch('http://localhost:5001/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: role // Add role since backend expects it
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      console.log("Signup successful:", data);
       // Store seller ID in local storage
       localStorage.setItem("sellerId", data.user_data.seller_id); //I changed this the seller ID is stored after login

      // Store user data in localStorage
      if (data.message === "User was created successfully!") {
        // Store the user ID (either seller_id or buyer_id) in localStorage
        localStorage.setItem('user', JSON.stringify({
          id: data.user_data.seller_id || data.user_data.buyer_id, // This will be either seller_id or buyer_id
          name: data.user_data.name,
          role: data.user_data.role,
          location: data.user_data.location
        }));
                
        // Log the seller_id or buyer_id
        if (role === "seller" && data.user_data.seller_id) {
          console.log("Seller ID:", data.user_data.seller_id);
        } else if (role === "buyer" && data.user_data.buyer_id) {
          console.log("Buyer ID:", data.user_data.buyer_id);
          localStorage.setItem("showTour", "true");
        }
      }
      
      // Redirect to the appropriate page based on role
      if (role === "seller") {
        navigate("/dashboard");
      } else {
        navigate("/homepage");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <>
      {/* Signup Page Header */}
      <header className="signup-header">
        <div className="logo">DealSpot</div>
        <nav className="nav-center">
          <ul className="nav-links">
            <li><a href="/" className="nav-link">Home</a></li>
            <li><a href="/contact" className="nav-link">Contact</a></li>
            <li><a href="/about" className="nav-link">About</a></li>
            <li><a href="/signup" className="nav-link">Sign Up</a></li>
          </ul>
        </nav>
        <div className="search-bar">
          <input type="text" placeholder="What are you looking for?" />
          <span className="search-icon">🔍</span>
        </div>
      </header>

      <div className="signup-container">
        {/* Left Side: Image */}
        <div className="signup-image">
          <img src="/images/shopping-cart.png" alt="Signup Illustration" />
        </div>

        {/* Right Side: Signup Form */}
        <div className="signup-form-container">
          <h1>Create an Account</h1>
          <p className="signup-subtext">Enter your details below</p>
          <p className="role-indicator">Signing up as: <strong>{role.charAt(0).toUpperCase() + role.slice(1)}</strong></p>

          {error && <p className="error-message">{error}</p>} 

          <form className="signup-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email or Phone Number"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />

            <input
              type="text"
              name="location"
              placeholder="City, Province (e.g., Toronto, ON)"
              value={formData.location}
              onChange={handleChange}
            />

            
            {/* Toggle to switch between seller and buyer */}
            <div className="role-toggle">
              <p>I want to:</p>
              <div className="toggle-buttons">
                <Link to="/signup" state={{ role: "buyer" }} className={`toggle-button ${role === "buyer" ? "active" : ""}`}>
                  Buy Items
                </Link>
                <Link to="/signup" state={{ role: "seller" }} className={`toggle-button ${role === "seller" ? "active" : ""}`}>
                  Sell Items
                </Link>
              </div>
            </div>
            
            <button type="submit" className="signup-button">Create Account</button>
          </form>

          <p className="login-link">
            Already have an account?{" "}
            <Link to="/login" className="login-link">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Signup Page Footer */}
      <footer className="signup-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Support</h4>
            <p>Toronto, ON</p>
            <p>dealspot@gmail.com</p>
          </div>

          <div className="footer-section">
            <h4>Account</h4>
            <p>My Account</p>
            <p>Login / Register</p>
            <p>Cart</p>
            <p>Wishlist</p>
            <p>Shop</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <p>Privacy Policy</p>
            <p>Terms of Use</p>
            <p>FAQ</p>
            <p>Contact</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Signup;