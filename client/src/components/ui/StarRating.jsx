import { useState } from "react";
import { Star } from "lucide-react";

const StarRating = ({ value = 0, onChange, readonly = false, size = 20 }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${readonly ? "star-btn--readonly" : ""}`}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
        >
          <Star
            size={size}
            className={`star-icon ${
              star <= (hovered || value) ? "star-icon--filled" : "star-icon--empty"
            }`}
            fill={star <= (hovered || value) ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
