import React from 'react'
import AuthService from 'services/auth/authService.js'

function Authorize({
  authorizedRoles,
  children
}) {
  const roles = AuthService.getAuthenticatedAccount().roles || ''

  const isAuthorized = authorizedRoles.some(role => {
    return roles.includes(role)
  })

  return isAuthorized
    ? children
    : <h2>Unauthorized to view this component.</h2>
}

export default Authorize
