import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { Link } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();
  
  // State for form fields
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    if (!formData.email || !formData.password) {
      setError("All fields are required.");
      return;
    }

    try {
      // Call backend API (port 5001)
      const response = await fetch('http://localhost:5001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      console.log("Login successful:", data);
      
      if (data.message === "Login was successful!") {
        // Store the user ID (either seller_id or buyer_id) in localStorage
        localStorage.setItem('user', JSON.stringify({
          id: data.user.id, // This will be either seller_id or buyer_id
          name: data.user.name,
          role: data.user.role,
        }));
                
        // Log seller_id if it exists
        if (data.user.seller_id) {
          console.log("Seller ID:", data.user.seller_id);
        }
      }
      
      // Redirect to appropriate page based on user role
      if (data.user && data.user.role === "seller") {
        navigate("/dashboard");
      } else {
        navigate("/homepage");
        localStorage.setItem("showTour", "true");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <>
      {/* Header */}
      <header className="login-header">
        <div className="logo">DealSpot</div>
        <nav className="nav-center">
          <ul className="nav-links">
            <li><a href="/" className="nav-link">Home</a></li>
            <li><a href="/contact" className="nav-link">Contact</a></li>
            <li><a href="/about" className="nav-link">About</a></li>
            <li><Link to="/signup" state={{ role: "buyer" }} className="nav-link">Sign Up</Link></li>
          </ul>
        </nav>
        <div className="search-bar">
          <input type="text" placeholder="What are you looking for?" />
          <span className="search-icon">🔍</span>
        </div>
      </header>

      <div className="login-container">
        {/* Left Side: Image */}
        <div className="login-image">
          <img src="/images/shopping-cart.png" alt="Login Illustration" />
        </div>

        {/* Right Side: Login Form */}
        <div className="login-form-container">
          <h1>Log in to DealSpot</h1>
          <p className="login-subtext">Enter your details below</p>

          {/* Show error message */}
          {error && <p className="error-message">{error}</p>}

          <form className="login-form" onSubmit={handleSubmit}>
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
            <button type="submit" className="login-button">Log In</button>
          </form>

          {/* Bottom Links */}
          <div className="login-bottom-links">
            <p className="forgot-password">Forgot Password?</p>

            <p className="signup-text">
              Don't have an account? <a href="/signup" className="signup-link">Sign Up</a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="login-footer">
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

export default Login;