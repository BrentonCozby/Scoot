import React from 'react'
import './ratingComponent.css'

export default function Rating({ rating, reviewCount }) {
  const roundedRating = Number(rating).toFixed(1)
  const showHalfStar = roundedRating[roundedRating.length - 1] >= 5

  let stars = []

  for (let i = 0; i < Math.floor(rating); i++) {
    stars.push(<i key={i} className="fas fa-star"/>)
  }

  if (Math.floor(rating) < 5 && showHalfStar) {
    stars.push(<i key={stars.length} className="fas fa-star-half-alt"/>)
  }

  for (let i = 0; 5 - stars.length; i++) {
    stars.push(<i key={stars.length + i} className="far fa-star"/>)
  }

  return (
    <div className="rating">
      {stars} (<span className="review-count">{parseInt(reviewCount, 10).toLocaleString()}</span>)
    </div>
  )
}
