import React from 'react'

function NoMatch({ location }) {
  return (
    <div className="no-match-component">
      <h2>Page not found for <code>{location.pathname}</code></h2>
    </div>
  )
}

export default NoMatch
