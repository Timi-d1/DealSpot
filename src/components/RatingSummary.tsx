import React from "react";
import styles from "./RatingSummary.module.css";
import StarRating from "./StarRating";

interface RatingDistribution {
  value: number;
  percentage: number;
  width: number;
}

const RatingSummary: React.FC = () => {
  const averageRating = 4.3;
  const totalReviews = 37;

  const ratingDistribution: RatingDistribution[] = [
    { value: 5, percentage: 75, width: 173 },
    { value: 4, percentage: 16, width: 37 },
    { value: 3, percentage: 5, width: 16 },
    { value: 2, percentage: 1, width: 3 },
    { value: 1, percentage: 3, width: 10 },
  ];

  return (
    <aside className={styles.ratingSummary}>
      <h3 className={styles.title}>Stars</h3>

      <div className={styles.overviewContainer}>
        <div className={styles.averageRating}>{averageRating}</div>

        <div className={styles.starsContainer}>
          <StarRating initialRating={averageRating} readOnly size="medium" />
        </div>

        <p className={styles.reviewCount}>{totalReviews} Reviews</p>
      </div>

      <div className={styles.ratingsList}>
        {ratingDistribution.map((rating, index) => (
          <div key={rating.value} className={styles.ratingItem}>
            <span className={styles.ratingValue}>{rating.value}</span>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${rating.width}px` }}
              />
            </div>
            <span className={styles.percentageValue}>{rating.percentage}%</span>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <button className={styles.actionButton}>
          <div className={styles.buttonText}>
            <span className={styles.actionText}>ADD</span>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default RatingSummary;