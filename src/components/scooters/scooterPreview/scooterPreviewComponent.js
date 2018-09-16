import React from 'react'
import './scooterPreviewComponent.css'
import { Link } from 'react-router-dom'
import Rating from '../rating/ratingComponent.js'

function ScooterPreview ({
  scooter
}) {
  return (
    <div className="scooter-preview-component">
      <div className="row main-row">
        <div className="col-xs-100 col-sm-25 photo-container">
          <img className="main-scooter-photo" src={scooter.photo} alt={scooter.model}/>
        </div>
        <div className="col-xs-100 col-sm-75 detail-container">
          <div className="row">
            <div className="col-xs-12 title">
              <h4>{scooter.model}</h4>
            </div>
            <div className="col-xs-12">
              {scooter.reviewCount > 0 && <Rating rating={scooter.avgRating} reviewCount={scooter.reviewCount}/> }
              <div>
                <Link to={`/scooter-detail/${scooter.scooterId}/${scooter.model}`}>
                  <button className="btn btn-primary available">View Scooter</button>
                </Link>
              </div>
              <ul className="bullet-points">
                <li>Color: {scooter.color}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScooterPreview
