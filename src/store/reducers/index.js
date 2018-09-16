import { combineReducers } from 'redux'

import mapReducer from './map.js'
import scooterListReducer from './scooterList.js'

const rootReducer = combineReducers({
    map: mapReducer,
    scooterList: scooterListReducer
})

export default rootReducer
