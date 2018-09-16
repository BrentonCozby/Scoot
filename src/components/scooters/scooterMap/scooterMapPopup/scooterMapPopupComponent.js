import React from 'react'
import './scooterMapPopupComponent.css'

export default function ScooterMapPopup({
  scooter
}) {
  return (
    <div className="scooter-map-popup-component">
      <div className="popup">
        <a href={`/scooter-detail/${scooter.scooterId}/${scooter.model}`}>
          <img src={scooter.photo} alt={scooter.model}/>
          <h4 className="model">{scooter.model}</h4>
        </a>
      </div>
    </div>
  )
}
