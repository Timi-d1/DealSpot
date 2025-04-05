"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./StarRating.module.css";

interface StarRatingProps {
  initialRating?: number;
  totalStars?: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: "small" | "medium" | "large";
}

const StarRating: React.FC<StarRatingProps> = ({
  initialRating = 0,
  totalStars = 5,
  onChange,
  readOnly = false,
  size = "medium",
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = (selectedRating: number) => {
    if (readOnly) return;

    setRating(selectedRating);
    setSelectedStar(selectedRating);

    // Clear the "selected" animation state after animation completes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setSelectedStar(null);
    }, 400); // Match this with the animation duration

    if (onChange) {
      onChange(selectedRating);
    }
  };

  const handleMouseEnter = (hoveredRating: number) => {
    if (readOnly) return;
    setHoverRating(hoveredRating);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  const getSizeClass = () => {
    switch (size) {
      case "small":
        return styles.small;
      case "large":
        return styles.large;
      default:
        return styles.medium;
    }
  };

  return (
    <div className={styles.starRatingContainer} onMouseLeave={handleMouseLeave}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= (hoverRating || rating);
        const isSelected = starValue === selectedStar;

        return (
          <span
            key={index}
            className={`
              ${styles.star}
              ${isActive ? styles.active : ""}
              ${isSelected ? styles.selected : ""}
              ${getSizeClass()}
              ${readOnly ? styles.readOnly : ""}
            `}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            role={readOnly ? "presentation" : "button"}
            tabIndex={readOnly ? -1 : 0}
            aria-label={
              readOnly
                ? `${rating} out of ${totalStars} stars`
                : `Rate ${starValue} out of ${totalStars} stars`
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleClick(starValue);
                e.preventDefault();
              }
            }}
          >
            ★
          </span>
        );
      })}
      {!readOnly && (
        <span className={styles.ratingText} aria-live="polite">
          {hoverRating || rating || ""}
        </span>
      )}
    </div>
  );
};

export default StarRating;