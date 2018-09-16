import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import configStore from './store/index.js'
import 'whatwg-fetch'
import App from './App'
// import registerServiceWorker from './registerServiceWorker'
import history from './history.js'
import { Router } from 'react-router-dom'

const store = configStore()

ReactDOM.render((
  <Provider store={store}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>
), document.getElementById('root'))
// registerServiceWorker()
