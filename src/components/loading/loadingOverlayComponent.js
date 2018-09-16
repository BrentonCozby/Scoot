import React from 'react'
import './loadingComponent.css'
import Spinner from  './loadingSpinnerComponent.js'

function LoadingOverlay() {
  return (
    <div className="loading-overlay-component">
      <Spinner/>
    </div>
  )
}

export default LoadingOverlay
