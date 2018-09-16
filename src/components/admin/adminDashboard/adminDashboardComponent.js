import React from 'react'
import './adminDashboardComponent.css'
import { Link } from 'react-router-dom'
import Authorize from 'components/general/auth/authorizeComponent.js'

/* eslint import/no-webpack-loader-syntax: off */
import ScooterIcon from '-!svg-react-loader!./scooter.svg'

function AdminDashboard() {
  return (
    <Authorize authorizedRoles={['admin', 'manager']}>
      <div className="admin-dashboard-component">
        <div className="cards">
          <Link to="/admin/accounts" className="card">
            Accounts
            <i className="icon fas fa-user"/>
          </Link>
          <Link to="/admin/scooters" className="card">
            Scooters
            <ScooterIcon className="scooter-icon"/>
          </Link>
          <Link to="/admin/reservations" className="card">
            Reservations
            <i className="icon fas fa-calendar-check"/>
          </Link>
          <Link to="/admin/reviews" className="card">
            Reviews
            <i className="icon fas fa-star-half-alt"/>
          </Link>
        </div>
      </div>
    </Authorize>
  )
}

export default AdminDashboard
