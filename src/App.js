import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom'
import { isAuthenticated } from 'services/auth/authService.js'
import LoadingService from 'services/loading/loadingService.js'
import history from './history.js'

import 'css/sanitize.css';
import 'css/html5boilerplate.css';
import 'react-table/react-table.css'
import 'css/react-table-overrides.css'
import 'css/resets.css';
import 'css/print.css';
import 'css/utils.css';
import 'css/buttons.css';
import 'components/general/forms/forms.css';

import NoMatch from 'components/noMatch/noMatchComponent.js'
import Navbar from 'components/navbar/navbarComponent.js'
import Dashboard from 'components/dashboard/dashboardComponent.js'
import LoadingOverlay from 'components/loading/loadingOverlayComponent.js'
import Login from 'components/login/loginComponent.js'
import SignUp from 'components/signUp/signUpComponent.js'
import ScooterDetail from 'components/scooters/scooterDetail/scooterDetailComponent.js';
import AccountsAdmin from 'components/admin/accountsAdmin/accountsAdminComponent.js'
import ScootersAdmin from 'components/admin/scootersAdmin/scootersAdminComponent.js'
import ReservationsAdmin from 'components/admin/reservationsAdmin/reservationsAdminComponent.js'

class App extends Component {

  state = {
    navbarHeight: 40,
    isLoadingQueueEmpty: true
  }

  shouldGoToDashboard = () => {
    return isAuthenticated() && ['/', '/login'].includes(history.location.pathname)
  }

  componentDidMount() {
    if (!isAuthenticated() && history.location.pathname !== '/sign-up') {
      history.redirect('/login')
    }

    if (this.shouldGoToDashboard()) {
      history.redirect('/dashboard')
    }

    LoadingService.listen('App.js', isLoadingQueueEmpty => {
      this.setState({ ...this.state, isLoadingQueueEmpty })
    })
  }

  componentDidUpdate() {
    if (!isAuthenticated() && history.location.pathname !== '/sign-up') {
      history.redirect('/login')
    }

    if (this.shouldGoToDashboard()) {
      history.redirect('/dashboard')
    }
  }

  renderRoutes = () => {
    return (
      <Switch>
        <Route path={'/dashboard'} component={Dashboard}/>
        <Route path={'/login'} component={Login}/>
        <Route path={'/sign-up'} component={SignUp}/>
        <Route path={'/scooter-detail/:scooterId/:model'} component={ScooterDetail}/>
        <Route path={'/admin/accounts'} component={AccountsAdmin}/>
        <Route path={'/admin/scooters'} component={ScootersAdmin}/>
        <Route path={'/admin/reservations/scooters/:scooterId'} component={ReservationsAdmin}/>
        <Route path={'/admin/reservations/accounts/:accountId'} component={ReservationsAdmin}/>
        <Route path={'/admin/reservations'} component={ReservationsAdmin}/>
        <Route component={NoMatch}/>
      </Switch>
    )
  }

  render() {
    const mainStyle = {
      padding: '10px',
      paddingTop: `${this.state.navbarHeight + 10}px`,
      backgroundColor: '#f8f8f8',
      minHeight: '100vh',
      position: 'relative'
    }

    return (
      <div className='App'>
        <Navbar height={this.state.navbarHeight}/>
        <main style={mainStyle}>
          {!this.state.isLoadingQueueEmpty && <LoadingOverlay/>}
          {this.renderRoutes()}
        </main>
      </div>
    );
  }
}

export default App;
