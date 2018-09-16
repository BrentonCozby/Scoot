import {
  UPDATE_SCOOTER_LIST
} from '../actions/index.js'

const initialState = {
  list: []
}
export default function (state = initialState, action) {
  switch (action.type) {
    case UPDATE_SCOOTER_LIST:
      return { ...state,
        list: action.scooterList
      }
    default:
      return state
  }
}
