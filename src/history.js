import createHistory from 'history/createBrowserHistory'

const history = createHistory()

history.redirect = (path) => {
  if (history.location.pathname !== path) {
    history.replace(path)
  }
}

export default history
