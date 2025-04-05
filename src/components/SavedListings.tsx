import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SavedListings.module.css"; // Import CSS file

interface Listing {
  listing_id: string;
  listing_name: string;
  image: string;
  price: number;
}

const SavedListings: React.FC = () => {
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from local storage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    if (!user || !user.id) return;

    // Fetch saved listings for user
    fetch(`http://localhost:5001/api/saved_listings/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setSavedListings(data);
      })
      .catch((error) => console.error("Error fetching saved listings:", error));
  }, [user]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Saved Listings</h1>
      {savedListings.length === 0 ? (
        <p className={styles.noItems}>No saved listings found.</p>
      ) : (
        <div className={styles.grid}>
          {savedListings.map((listing) => (
            <div 
              key={listing.listing_id} 
              className={styles.card} 
              onClick={() => navigate(`/listing/${listing.listing_id}`)}
            >
              <img src={listing.image} alt={listing.listing_name} className={styles.image} />
              <h3 className={styles.listingName}>{listing.listing_name}</h3>
              <p className={styles.price}>${listing.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedListings;
