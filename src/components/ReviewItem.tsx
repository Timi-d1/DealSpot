import React from "react";
import styles from "./ReviewItem.module.css";
import StarRating from "./StarRating";

interface ReviewItemProps {
  id: string;
  name: string;
  review: string;
  rating?: number;
  date?: string;
  verified?: boolean;
  isOwnReview?: boolean; // New prop to check if the review belongs to the current user
  onEdit?: (id: string) => void; // Callback for edit
  onDelete?: (id: string) => void; // Callback for delete
  className?: string;
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  id,
  name,
  review,
  rating = 5,
  date = "2 days ago",
  verified = true,
  isOwnReview = false,
  onEdit,
  onDelete,
  className,
}) => {
  return (
    <article className={`${styles.reviewItem} ${className || ""}`}>
      <h4 className={styles.reviewAuthor}>{name}</h4>

      <div className={styles.reviewMeta}>
        {rating > 0 && (
          <div className={styles.reviewRating}>
            <StarRating initialRating={rating} readOnly size="small" />
          </div>
        )}

        <time className={styles.reviewDate}>{date}</time>

        {verified && <span className={styles.verified}>Verified Purchase</span>}
      </div>

      <p className={styles.reviewContent}>{review}</p>

      <div className={styles.reviewActions}>
        <button className={styles.actionButton}>Helpful</button>
        <button className={styles.actionButton}>Report</button>
        
        {/* Only show edit/delete buttons if it's the user's own review */}
        {isOwnReview && (
          <>
            <button 
              className={`${styles.actionButton} ${styles.editButton}`} 
              onClick={() => onEdit && onEdit(id)}
            >
              Edit
            </button>
            <button 
              className={`${styles.actionButton} ${styles.deleteButton}`} 
              onClick={() => onDelete && onDelete(id)}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </article>
  );
};

export default ReviewItem;