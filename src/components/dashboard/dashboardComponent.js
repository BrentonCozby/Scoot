import React, { Component } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import AdminDashboard from 'components/admin/adminDashboard/adminDashboardComponent.js'
import ScooterDashboard from 'components/scooters/scooterDashboard/scooterDashboardComponent.js'
import AuthService from 'services/auth/authService.js'

class Dashboard extends Component {

  render() {
    const roles = AuthService.getAuthenticatedAccount().roles || ''
    const canEditAccounts = roles.includes('admin') || roles.includes('manager')

    return (
      <div className="dashboard-component">
        <Switch>
          <Route path="/dashboard/scooters" component={ScooterDashboard}/>
          {canEditAccounts && <Route path="/dashboard/admin" component={AdminDashboard}/>}
          <Redirect to="/dashboard/scooters"/>
        </Switch>
      </div>
    )
  }
}

export default Dashboard
