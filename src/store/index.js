import { createStore, applyMiddleware } from 'redux'
import reduxPromise from 'redux-promise'

import rootReducer from './reducers/index.js'

const createStoreWithMiddleware = applyMiddleware(
    reduxPromise
)(createStore)

export default function configStore(initialState) {
    const store = createStoreWithMiddleware(rootReducer, initialState)

    if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        module.hot.accept('./reducers/index.js', () => {
            const nextRootReducer = require('./reducers/index.js').default
            store.replaceReducer(nextRootReducer)
        })
    }

  return store
}
