import { createBrowserHistory } from 'history'

const history = createBrowserHistory()

history.redirect = (path) => {
  if (history.location.pathname !== path) {
    history.replace(path)
  }
}

export default history
