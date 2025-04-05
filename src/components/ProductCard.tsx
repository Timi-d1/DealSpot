import React, { useState, useEffect } from 'react';
import styles from './ProductCard.module.css';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


interface ProductCardProps {
  images: string[];
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  description: string;
  delivery_option: string[];
  number_of_units: number;
  dimensions: { length: number; width: number; height: number };
  seller: { name: string; id: string };
  sellerLocation?: string; // Fix location variable conflict
}

const ProductCard: React.FC<ProductCardProps> = ({
  images,
  name,
  price,
  originalPrice,
  rating,
  description,
  number_of_units,
  dimensions,
  delivery_option,
  seller,
  sellerLocation,
}) => {
  const [sellerRating, setSellerRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (user && user.id) {
      fetch(`http://localhost:5001/api/saved_listings/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          const saved = data.some((listing) => listing.listing_id === name);
          setIsFavorited(saved);
        })
        .catch((error) => console.error("Error fetching saved listings:", error));
    }
  }, [user, name]);

  const handleFavoriteClick = async () => {
    if (!user || !user.id) {
      alert("You need to log in to save products!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/save_listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          listing_id: name,
          listing_name: name,
          image: images[0] || "https://via.placeholder.com/150", // ✅ ONLY the first image
          price,
        }),
        
      });

      if (response.ok) {
        setIsFavorited((prev) => !prev);
        window.dispatchEvent(new Event("savedListingsUpdated"));
      } else {
        console.error("Failed to update saved listings");
      }
    } catch (error) {
      console.error("Error saving listing:", error);
    }
  };

  useEffect(() => {
    const fetchSellerRating = async () => {
      try {
        const response = await fetch(`http://localhost:5001/reviews/summary?seller_id=${seller.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.summary) {
            setSellerRating(data.summary.average_rating);
            setReviewCount(data.summary.total_reviews);
          }
        }
      } catch (error) {
        console.error('Error fetching seller rating:', error);
      }
    };

    fetchSellerRating();
  }, [seller.id]);

  return (
    <div className={styles.productCard}>
      <div className={styles.imageContainer}>
        {/* <div className={styles.actionButtons}>
          <button className={styles.actionButton} onClick={handleFavoriteClick} aria-label="Add to favorites">
            {isFavorited ? '❤️' : '🤍'}
          </button>
        </div>
        <Slider dots infinite speed={500} slidesToShow={1} slidesToScroll={1}>
          {images.map((imgUrl, idx) => (
            <div key={idx}>
              <img
                src={imgUrl}
                alt={`${name}-${idx}`}
                className={styles.productImage}
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
            </div>
          ))}
        </Slider> */}
        <div className={styles.actionButtons} style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 2 }}>
    <button
      className={styles.actionButton}
      onClick={handleFavoriteClick}
      aria-label="Add to favorites"
    >
      {isFavorited ? '❤️' : '🤍'}
    </button>
  </div>

  <Slider dots infinite speed={500} slidesToShow={1} slidesToScroll={1}>
    {images.map((imgUrl, idx) => (
      <div key={idx}>
        <img
          src={imgUrl}
          alt={`${name}-${idx}`}
          className={styles.productImage}
          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
        />
      </div>
    ))}
  </Slider>

        <div className={styles.detailsOverlay}>
          <div className={styles.overlayHeader}>
            <h3 className={styles.overlayTitle}>{name}</h3>
            <div className={styles.priceContainer}>
              <span className={styles.price}>${price}</span>
              {originalPrice && <span className={styles.originalPrice}>${originalPrice}</span>}
            </div>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Description:</span>
            <span className={styles.detailValue}>{description}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Available:</span>
            <span className={styles.detailValue}>{number_of_units} units</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Dimensions:</span>
            <span className={styles.detailValue}>
              {dimensions.length}x{dimensions.width}x{dimensions.height}cm
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Delivery:</span>
            <span className={styles.detailValue}>{delivery_option.join(', ')}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Rating:</span>
            <span className={styles.detailValue}>{rating}/5</span>
          </div>

          {/* ✅ Location Now Displayed Under Rating */}
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Location:</span>
            <span className={styles.detailValue}>{sellerLocation || "Location not available"}</span>
          </div>
        </div>
      </div>

      <div className={styles.sellerInfoContainer}>
        <div className={styles.sellerName}>
          Sold by: <Link to={`/review?sellerId=${seller.id}`}>{seller.name}</Link>
          {sellerRating !== null && (
            <span className={styles.sellerRating}>
              <span className={styles.ratingValue}>{sellerRating.toFixed(1)}</span>/5
              <span className={styles.reviewCount}>
                ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </span>
          )}
        </div>

        <div className={styles.sellerActions}>
          <Link to={`/review?sellerId=${seller.id}`} className={styles.actionLink}  data-tour-id="review-step">
            <span className={styles.actionIcon}>⭐</span>
            Reviews
          </Link>
          <span className={styles.actionSeparator}></span>
          <Link to={`/message?sellerId=${seller.id}`} className={styles.actionLink}>
            <span className={styles.actionIcon}>✉️</span>
            Message
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
