import React from 'react'
import './scooterDashboardComponent.css'
import ScooterMap from '../scooterMap/scooterMapComponent.js'
import ScooterList from '../scooterList/scooterListComponent.js'

function ScooterDashboard() {
  return (
    <div className="scooter-dashboard-component">
      <ScooterMap mapId="dashboard-scooter-map" />
      <ScooterList/>
    </div>
  )
}

export default ScooterDashboard
