"use client";
import React, { useState } from "react";
import styles from "./ReviewForm.module.css";
import StarRating from "./StarRating";

interface ReviewFormProps {
  onSubmit: (reviewData: { text: string; rating: number }) => Promise<void>;
  initialRating?: number;
  initialText?: string;
  isEditing?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  onSubmit, 
  initialRating = 0, 
  initialText = "", 
  isEditing = false 
}) => {
  const [reviewText, setReviewText] = useState(initialText);
  const [userRating, setUserRating] = useState(initialRating);
  const [charCount, setCharCount] = useState(initialText.length);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setReviewText(text);
    setCharCount(text.length);
  };

  const handleRatingChange = (rating: number) => {
    setUserRating(rating);
  };

  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    // Validate input
    if (userRating === 0) {
      setError("Please select a rating before submitting your review.");
      return;
    }
    
    if (!reviewText.trim()) {
      setError("Please enter a review comment.");
      return;
    }
    
    try {
      setError(null);
      setIsSubmitting(true);
      
      // Call the onSubmit callback
      await onSubmit({ text: reviewText, rating: userRating });
      
      // Reset form after successful submission (only if not editing)
      if (!isEditing) {
        setReviewText("");
        setUserRating(0);
        setCharCount(0);
      }
      
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.formContainer}>
      <h3 className={styles.reviewHeading}>
        {isEditing ? "Edit Your Review" : "Customer Reviews"}
      </h3>

      <div className={styles.ratingContainer}>
        <label htmlFor="rating" className={styles.ratingLabel}>
          Your Rating:
        </label>
        <StarRating
          initialRating={userRating}
          onChange={handleRatingChange}
          size="large"
        />
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.fields}>
        <div className={styles.textareaContainer}>
          <textarea
            className={styles.textarea}
            value={reviewText}
            onChange={handleTextChange}
            maxLength={1200}
            aria-label="Review text"
            placeholder="Write your review here..."
            disabled={isSubmitting}
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/7828024ee86c4bbf865bbe6cda7599c6/41bc5ba014fbc512bb4859aae02bd5db582d8bc0b662852db1e7a5283f6d160e?placeholderIfAbsent=true"
            alt="Edit"
            className={styles.editIcon}
          />
        </div>
        <div className={styles.charCount}>{charCount}/1200</div>
      </div>

      <button 
        onClick={handleSubmit} 
        className={styles.submitButton}
        disabled={isSubmitting}
      >
        {isSubmitting ? 
          (isEditing ? "Saving..." : "Posting...") : 
          (isEditing ? "Save Changes" : "Post")
        }
      </button>
    </section>
  );
};

export default ReviewForm;