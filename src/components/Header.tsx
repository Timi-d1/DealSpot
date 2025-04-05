import React, { useState, useEffect } from "react";
import styles from './Header.module.css';
import { useNavigate } from "react-router-dom";
import Popup from './popup'; 

interface HeaderProps {
  setSearchQuery: (query: string) => void;
}

interface Listing {
  listing_id: string;
  listing_name: string;
  image: string;
  price: number;
}

const Header: React.FC<HeaderProps> = ({ setSearchQuery }) => {
  const [searchQuery, setLocalSearchQuery] = useState("");
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [user, setUser ] = useState<{ id: string; role: string } | null>(null); // Include role in user state
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [showSavedDropdown, setShowSavedDropdown] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const navigate = useNavigate();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalSearchQuery(query);
    setSearchQuery(query);
  };

  useEffect(() => {
    const fetchSavedListings = () => {
      const storedUser  = localStorage.getItem("user");
      if (!storedUser ) return;

      const parsedUser  = JSON.parse(storedUser );
      setUser (parsedUser );

      fetch(`http://localhost:5001/api/saved_listings/${parsedUser .id}`)
        .then((res) => res.json())
        .then((data) => {
          setSavedListings(data);
        })
        .catch((error) => console.error("Error fetching saved listings:", error));
    };

    fetchSavedListings(); // initial fetch

    window.addEventListener("savedListingsUpdated", fetchSavedListings);
    return () => {
      window.removeEventListener("savedListingsUpdated", fetchSavedListings);
    };
  }, []);

  // Close dropdowns if click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(`.${styles.userAction}`)) {
        setShowSavedDropdown(false);
        setShowCartDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDashboardClick = () => {
    if (user && user.role === 'seller') {
      navigate("/dashboard"); // Navigate to dashboard if user is a seller
    } else {
      setShowPopup(true); // Show popup if user is a buyer
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false); // Close the popup
  };

  const handleTakeMeThere = () => {
    navigate("/signup", { state: { role: "seller" } });
    setShowPopup(false); // Close the popup
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoNavContainer}>
        <div className={styles.logo}>DealSpot</div>
        <nav className={styles.navigation}>
          <ul className="nav-links">
            <li><a href="/homepage" className="nav-link">Home</a></li>
            <li><a href="/message" className="nav-link">Messages</a></li>
            <li><a href="#" className="nav-link" onClick={handleDashboardClick}>Dashboard</a></li> {/* Updated to use handleDashboardClick */}
            <li><a href="/account" className="nav-link">Account</a></li>
          </ul>
        </nav>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchComponentSet}>
          <div className={styles.searchInputWrapper}>
            <label htmlFor="searchInput" className={styles.visuallyHidden}>Search</label>
            <input
              id="searchInput"
              type="text"
              className={styles.searchInput}
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={handleSearch}
              data-tour-id="search"
            />
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/7a36546edd30f9649053810fdbf6c98d92541e863e7b8b10ab13af855343b34e"
              className={styles.searchIcon}
              alt="Search"
            />
          </div>
        </div>

        {/* ❤️ Saved Listings */}
        <div className={styles.userAction} data-tour-id="saved-items" onClick={() => {
          setShowSavedDropdown(prev => !prev);
          setShowCartDropdown(false);
        }}>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/850597cc14d3bfef027aa097fc5bca3ac1b650d683dc1d3c8c0134d5cd9a061d"
            className={styles.actionIcon}
            alt="Saved Listings"
          />
          {showSavedDropdown && (
            <div className={styles.dropdown}>
              {savedListings.length > 0 ? (
                <div className={styles.savedListingsContainer}>
                  {savedListings.map((listing) => (
                    <div
                      key={listing.listing_id}
                      className={styles.savedListingItem}
                      onClick={() => navigate(`/listing/${listing.listing_id}`)}
                    >
                      <img src={listing.image} alt={listing.listing_name} />
                      <div className={styles.savedListingInfo}>
                        <p>{listing.listing_name}</p>
                        <span>${listing.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.noItems}>No saved listings</p>
              )}
              <button onClick={() => navigate("/saved-listings")} className={styles.viewAllButton}>View All</button>
            </div>
          )}
        </div>

        {/* 🛒 Cart */}
        <div className={styles.userAction} onClick={() => {
          setShowCartDropdown(prev => !prev);
          setShowSavedDropdown(false);
        }}>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/7838bcbdc908d4798bf5055d898d1af3dddebe7742136359ab1ef6cbbec6472c"
            className={styles.actionIcon}
            alt="Cart"
          />
          {showCartDropdown && (
            <div className={styles.dropdown}>
              {cartItems.length > 0 ? (
                cartItems.map((item, index) => <p key={index}>{item}</p>)
              ) : (
                <p className={styles.noItems}>Your cart is empty</p>
              )}
              <button onClick={() => navigate("/cart")} className={styles.viewAllButton}>View Cart</button>
            </div>
          )}
        </div>
      </div>

      {/* Popup for access denied */}
      {showPopup && (
        <Popup onClose={handleClosePopup} onTakeMeThere={handleTakeMeThere} />
      )}
    </header>
  );
};

export default Header;