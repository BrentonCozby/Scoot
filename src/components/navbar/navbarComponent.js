import React from 'react'
import './navbarComponent.css'
import { NavLink } from 'react-router-dom'
import AuthService, { isAuthenticated, logout } from 'services/auth/authService.js'
import logo from './scoot-logo.png'

function Logo({ navbarHeight }) {
  const RATIO = 964 / 233

  const containerStyle = {
    boxSizing: 'border-box',
    padding: '7px',
    width: `${(navbarHeight - 14) * RATIO}px`
  }

  const logoStyle = {
    width: '100%'
  }

  return (
    <div style={containerStyle}>
      <img src={logo} alt="Account App logo" style={logoStyle} className="logo"/>
    </div>
  )
}

function Navbar({ height }) {

  function renderDashboardLinks() {
    const roles = AuthService.getAuthenticatedAccount().roles || ''

    const links = [
      <NavLink key="scooters" to="/dashboard/scooters" className="btn btn-link nav-link" activeClassName="is-active">Scooters</NavLink>
    ]

    if (roles.includes('manager') || roles.includes('admin')) {
      links.push(<NavLink key="accounts" to="/dashboard/admin" className="btn btn-link nav-link" activeClassName="is-active">Admin</NavLink>)
    }

    return links
  }

  return (
    <header className="navbar-component" style={{ height: `${height}px` }}>
      <Logo navbarHeight={height}/>
      <nav>
        {isAuthenticated() && renderDashboardLinks()}
        {isAuthenticated() && <button className="btn btn-link nav-link" onClick={logout}>Logout</button>}
      </nav>
    </header>
  )
}

export default Navbar
