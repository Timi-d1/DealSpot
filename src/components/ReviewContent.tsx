"use client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import contentStyles from "./ReviewContent.module.css";
import legacyStyles from "./SellerReview.module.css";
import ReviewItem from "./ReviewItem";
import ReviewForm from "./ReviewForm";

// Update to accept sellerId as a prop
interface ReviewContentProps {
  sellerId: string;
}

interface Review {
  id: string;
  buyer_id: string;
  seller_id: string;
  rating: number;
  comment: string;
  date?: string;
  name?: string;
  review?: string;
  verified?: boolean;
  buyer_name?: string;  // Added for featured reviews
  created_at?: any;     // Added for date formatting
}

interface ReviewSummary {
  total_reviews: number;
  average_rating: number;
  rating_distribution: Record<number, number>;
  rating_percentages: Record<number, number>;
}

const ReviewContent: React.FC<ReviewContentProps> = ({ sellerId }) => {
  const navigate = useNavigate();

  // Add state for seller name
  const [sellerName, setSellerName] = useState<string>("");

  // State for reviews and UI
  const [reviews, setReviews] = useState<Review[]>([]);
  const [featuredReviews, setFeaturedReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  // State for editing functionality
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ rating: 0, text: "" });

  // Filtering and sorting state
  const [sortBy, setSortBy] = useState("newest");
  const [filterRating, setFilterRating] = useState("all");

  // Get current user ID from localStorage
  const getCurrentUserId = () => {
    try {
      // Try to get user from local storage, fallback to a default for testing
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || user.document_id || "current-user-id";
      }
      return "current-user-id";
    } catch (e) {
      console.error("Error getting user ID:", e);
      return "current-user-id";  // Default for testing
    }
  };

  // Log for debugging
  useEffect(() => {
    console.log(`ReviewContent mounted with sellerId: ${sellerId}`);
    console.log(`Current user ID: ${getCurrentUserId()}`);
  }, [sellerId]);

  // Add useEffect to fetch seller name
useEffect(() => {
  const fetchSellerName = async () => {
    try {
      console.log(`Fetching seller name for ID: ${sellerId}`);
      
      // Look for seller in Users collection
      const response = await fetch(`http://localhost:5001/api/seller_name?seller_id=${sellerId}`);
      console.log(`API response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`API returned data:`, data);
        
        if (data.name) {
          console.log(`Setting seller name to: ${data.name}`);
          setSellerName(data.name);
        } else {
          console.log(`No name found for seller ID: ${sellerId}`);
        }
      } else {
        console.error(`Failed to fetch seller name: ${response.statusText}`);
      }
    } catch (err) {
      console.error("Error fetching seller name:", err);
    }
  };
  
  if (sellerId) {
    fetchSellerName();
  }
}, [sellerId]);

  // Fetch all reviews data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Starting to fetch review data...");
        setLoading(true);
        setError(null);
        
        // Get reviews
        console.log(`Fetching reviews for seller: ${sellerId}`);
        const reviewsResponse = await fetch(`http://localhost:5001/reviews?seller_id=${sellerId}`);
        if (!reviewsResponse.ok) {
          throw new Error(`Failed to fetch reviews: ${reviewsResponse.status} ${reviewsResponse.statusText}`);
        }
        const reviewsData = await reviewsResponse.json();
        console.log("Reviews data received:", reviewsData);
        
        // Get featured reviews
        console.log("Fetching featured reviews...");
        const featuredResponse = await fetch(`http://localhost:5001/reviews/featured?seller_id=${sellerId}&limit=3`);
        if (!featuredResponse.ok) {
          console.warn(`Featured reviews fetch failed: ${featuredResponse.status} ${featuredResponse.statusText}`);
          // Continue even if featured reviews fail
        } else {
          const featuredData = await featuredResponse.json();
          console.log("Featured reviews data received:", featuredData);
          setFeaturedReviews(featuredData.featured_reviews || []);
        }
        
        // Get summary statistics
        console.log("Fetching review summary...");
        const summaryResponse = await fetch(`http://localhost:5001/reviews/summary?seller_id=${sellerId}`);
        if (!summaryResponse.ok) {
          console.warn(`Summary fetch failed: ${summaryResponse.status} ${summaryResponse.statusText}`);
          // Continue even if summary fails
        } else {
          const summaryData = await summaryResponse.json();
          console.log("Summary data received:", summaryData);
          setSummary(summaryData.summary || null);
        }
        
        // Check if current user has reviewed this seller
        const currentUserId = getCurrentUserId();
        console.log(`Checking if user ${currentUserId} has reviewed seller ${sellerId}`);
        const checkResponse = await fetch(`http://localhost:5001/reviews/check?buyer_id=${currentUserId}&seller_id=${sellerId}`);
        if (!checkResponse.ok) {
          console.warn(`Review check failed: ${checkResponse.status} ${checkResponse.statusText}`);
          // Continue even if check fails
        } else {
          const checkData = await checkResponse.json();
          console.log("Check result:", checkData);
          setUserHasReviewed(checkData.has_reviewed);
        }
        
        // Format reviews for frontend display
        const formattedReviews = reviewsData.reviews.map((review: any) => {
          const createdAt = new Date(review.created_at); // Convert string to Date object
          return {
            id: review.id,
            name: review.buyer_name || `User ${review.buyer_id}`,
            review: review.comment,
            rating: review.rating,
            date: createdAt instanceof Date && !isNaN(createdAt.getTime()) // Check if it's a valid Date
              ? createdAt.toLocaleDateString("en-US") // MM/DD/YYYY format
              : "Recent", 
            verified: true,
            buyer_id: review.buyer_id,
            seller_id: review.seller_id,
            comment: review.comment,
            created_at: review.created_at
          };
        });
        
        console.log("Formatted reviews:", formattedReviews);
        setReviews(formattedReviews);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching review data:", err);
        setError(`Failed to load reviews. Please try again later. (${err.message})`);
        // Set empty arrays as fallback
        setReviews([]);
        setFeaturedReviews([]);
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchData();
    } else {
      console.error("No sellerId provided");
      setError("No seller specified. Please go back and select a seller.");
    }
  }, [sellerId]);

  // Handle initial review submission
  const handleReviewSubmit = async (reviewData: { text: string; rating: number }) => {
    try {
      console.log("Submitting review:", reviewData);
      setError(null);
      
      // Get current user ID
      const buyerId = getCurrentUserId();
      console.log(`Submitting as buyer ID: ${buyerId}`);
      
      // Call API to add review
      const response = await fetch('http://localhost:5001/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyer_id: buyerId,
          seller_id: sellerId,
          rating: reviewData.rating,
          comment: reviewData.text
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }
      
      const responseData = await response.json();
      console.log("Review submission successful:", responseData);
      
      // Refresh reviews after successful submission
      console.log("Refreshing reviews...");
      const refreshResponse = await fetch(`http://localhost:5001/reviews?seller_id=${sellerId}`);
      if (!refreshResponse.ok) {
        throw new Error("Failed to refresh reviews");
      }
      const refreshData = await refreshResponse.json();
      
      // Format and update reviews
      const formattedReviews = refreshData.reviews.map((review: any) => {
        const createdAt = new Date(review.created_at); // Convert string to Date object
        return {
          id: review.id,
          name: review.buyer_name || `User ${review.buyer_id}`,
          review: review.comment,
          rating: review.rating,
          date: createdAt instanceof Date && !isNaN(createdAt.getTime()) // Check if it's a valid Date
            ? createdAt.toLocaleDateString("en-US") // MM/DD/YYYY format
            : "Recent", 
          verified: true,
          buyer_id: review.buyer_id,
          seller_id: review.seller_id,
          comment: review.comment,
          created_at: review.created_at
        };
      });
      
      setReviews(formattedReviews);
      setUserHasReviewed(true);
      
      // Also refresh the summary
      const summaryResponse = await fetch(`http://localhost:5001/reviews/summary?seller_id=${sellerId}`);
      const summaryData = await summaryResponse.json();
      setSummary(summaryData.summary || null);
      
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setError(err.message || "Failed to submit review. Please try again.");
      throw err; // Re-throw to let the form component handle it
    }
  };

  // Handle editing a review
  const handleEditClick = (reviewId: string) => {
    const reviewToEdit = reviews.find(review => review.id === reviewId);
    if (reviewToEdit) {
      setEditFormData({
        rating: reviewToEdit.rating,
        text: reviewToEdit.comment || reviewToEdit.review || ""
      });
      setEditingReviewId(reviewId);
    }
  };

  // Handle saving edited review
  const handleSaveEdit = async (reviewData: { text: string; rating: number }) => {
    if (!editingReviewId) return;
    
    try {
      console.log(`Saving edited review ${editingReviewId}:`, reviewData);
      setError(null);
      
      const response = await fetch(`http://localhost:5001/reviews/${editingReviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyer_id: getCurrentUserId(),
          rating: reviewData.rating,
          comment: reviewData.text
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update review");
      }
      
      console.log("Review update successful");
      
      // Refresh reviews after successful update
      const refreshResponse = await fetch(`http://localhost:5001/reviews?seller_id=${sellerId}`);
      const refreshData = await refreshResponse.json();
      
      // Format and update reviews
      const formattedReviews = refreshData.reviews.map((review: any) => {
        const createdAt = new Date(review.created_at); // Convert string to Date object
        return {
          id: review.id,
          name: review.buyer_name || `User ${review.buyer_id}`,
          review: review.comment,
          rating: review.rating,
          date: createdAt instanceof Date && !isNaN(createdAt.getTime()) // Check if it's a valid Date
            ? createdAt.toLocaleDateString("en-US") // MM/DD/YYYY format
            : "Recent", 
          verified: true,
          buyer_id: review.buyer_id,
          seller_id: review.seller_id,
          comment: review.comment,
          created_at: review.created_at
        };
      });
      
      setReviews(formattedReviews);
      setEditingReviewId(null);
      
      // Also refresh the summary
      const summaryResponse = await fetch(`http://localhost:5001/reviews/summary?seller_id=${sellerId}`);
      const summaryData = await summaryResponse.json();
      setSummary(summaryData.summary || null);
      
    } catch (err: any) {
      console.error("Error updating review:", err);
      setError(err.message || "Failed to update review. Please try again.");
      throw err; // Re-throw for the form to handle
    }
  };

  // Handle deleting a review
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }
    
    try {
      console.log(`Deleting review ${reviewId}`);
      setError(null);
      
      const buyerId = getCurrentUserId();
      const response = await fetch(`http://localhost:5001/reviews/${reviewId}?buyer_id=${buyerId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete review");
      }
      
      console.log("Review deletion successful");
      
      // Remove the review from the state
      setReviews(reviews.filter(review => review.id !== reviewId));
      
      // User no longer has a review
      setUserHasReviewed(false);
      
      // Also refresh the summary
      const summaryResponse = await fetch(`http://localhost:5001/reviews/summary?seller_id=${sellerId}`);
      const summaryData = await summaryResponse.json();
      setSummary(summaryData.summary || null);
      
    } catch (err: any) {
      console.error("Error deleting review:", err);
      setError(err.message || "Failed to delete review. Please try again.");
    }
  };

  // Filter and sort reviews
  const filteredReviews = reviews.filter((review) => {
    if (filterRating === "all") return true;
    return review.rating === parseInt(filterRating);
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "highest") return b.rating - a.rating;
    if (sortBy === "lowest") return a.rating - b.rating;
    // Default to newest - if we have dates, use those, otherwise use IDs
    const aDate = a.created_at ? new Date(a.created_at.seconds * 1000).getTime() : parseInt(a.id);
    const bDate = b.created_at ? new Date(b.created_at.seconds * 1000).getTime() : parseInt(b.id);
    return bDate - aDate;
  });

  // Function to handle the "Message Seller" button click
  const handleMessageClick = () => {
    navigate(`/message?sellerId=${sellerId}`);
  };

  return (
    <>
      <section className={contentStyles.mainSection}>
        <div className={contentStyles.contentContainer}>
          <div className={contentStyles.userContent}>
            {/* Enhanced seller profile with better styling */}
            <div className={contentStyles.userProfile}>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/7828024ee86c4bbf865bbe6cda7599c6/754f1241f66726d9a7941d25e8269c4572acb90abb63724b39586d8d8a92a698?placeholderIfAbsent=true"
                alt="Seller profile"
                className={contentStyles.profileImage}
              />
              <div className={contentStyles.userInfo}>
              <h2 className={contentStyles.userName}>{sellerName || `Seller #${sellerId}`}</h2>
                
                {summary && (
                  <div className={contentStyles.ratingSummary}>
                    <div className={contentStyles.averageRating}>
                      <span className={contentStyles.ratingValue}>{summary.average_rating.toFixed(1)}</span>
                      <span className={contentStyles.maxRating}>/5</span>
                    </div>
                    <div className={contentStyles.totalReviews}>
                      Based on {summary.total_reviews} {summary.total_reviews === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Review form section */}
            {editingReviewId ? (
              // Editing form
              <ReviewForm 
                onSubmit={handleSaveEdit}
                initialRating={editFormData.rating}
                initialText={editFormData.text}
                isEditing={true}
              />
            ) : (
              // Only show new review form if user hasn't already reviewed
              !userHasReviewed && <ReviewForm onSubmit={handleReviewSubmit} />
            )}

            {/* Loading and error states */}
{loading ? (
  <div className={contentStyles.loading}>Loading reviews...</div>
) : error ? (
  <div className={contentStyles.error}>{error}</div>
) : reviews.length > 0 ? (
  <>
    {/* Filtering and sorting controls */}
    <div className={contentStyles.reviewFilters}>
      <label
        htmlFor="sort-by"
        className={contentStyles.filterLabel}
      >
        Sort by:
      </label>
      <select
        id="sort-by"
        className={contentStyles.filterSelect}
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="newest">Newest</option>
        <option value="highest">Highest Rating</option>
        <option value="lowest">Lowest Rating</option>
      </select>
      <label
        htmlFor="filter-rating"
        className={contentStyles.filterLabel}
      >
        Filter:
      </label>
      <select
        id="filter-rating"
        className={contentStyles.filterSelect}
        value={filterRating}
        onChange={(e) => setFilterRating(e.target.value)}
      >
        <option value="all">All Ratings</option>
        <option value="5">5 Stars</option>
        <option value="4">4 Stars</option>
        <option value="3">3 Stars</option>
        <option value="2">2 Stars</option>
        <option value="1">1 Star</option>
      </select>
    </div>
    {/* Reviews list */}
    {sortedReviews.length > 0 ? (
      <div className={contentStyles.reviewsList}>
        {sortedReviews.map((review) => (
          <ReviewItem
            key={review.id}
            id={review.id}
            name={review.name || `User ${review.buyer_id}`}
            review={review.review || review.comment}
            rating={review.rating}
            date={review.date || "Recent"}
            verified={review.verified || true}
            isOwnReview={review.buyer_id === getCurrentUserId()}
            onEdit={handleEditClick}
            onDelete={handleDeleteReview}
          />
        ))}
      </div>
    ) : (
      <div className={contentStyles.noReviews}>
        No reviews match the current filter. Try a different rating filter.
      </div>
    )}
  </>
) : (
  <div className={contentStyles.noReviews}>
    No reviews available for this seller yet. Be the first to leave a review!
  </div>
)}
</div>

          {/* Message button container */}
          <div className={contentStyles.buttonContainer}>
            <button 
              className={contentStyles.messageButton} 
              onClick={handleMessageClick}
            >
              Message Seller
            </button>
          </div>
        </div>
      </section>

      {/* Featured Review Section - Only show if featured reviews exist */}
      {featuredReviews.length > 0 && (
        <section className={contentStyles.featuredSection}>
          <div className={contentStyles.featuredContainer}>
            <div className={contentStyles.featuredLeft}>
              <div className={contentStyles.featuredReviewContainer}>
                <h3 className={contentStyles.featuredReviewHeading}>
                  Featured Review
                </h3>
                <ReviewItem
                  id={featuredReviews[0].id || ""}
                  name={featuredReviews[0].buyer_name || `User ${featuredReviews[0].buyer_id}`}
                  review={featuredReviews[0].comment}
                  rating={featuredReviews[0].rating}
                  date={featuredReviews[0].created_at ? 
                    new Date(featuredReviews[0].created_at.seconds * 1000).toLocaleDateString() : 
                    "Recent"}
                  verified={true}
                  isOwnReview={featuredReviews[0].buyer_id === getCurrentUserId()}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteReview}
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default ReviewContent;