import {
  SET_CURRENT_POSITION,
  UPDATE_MAP_BOUNDS
} from '../actions/index.js'

const initialState = {
  currentPosition: {
    lat: 25.771635,
    lng: -80.190096
  },
  mapBounds: {
    xmin: -80.290096,
    ymin: 25.771635,
    xmax: -80.190096,
    ymax: 25.871635
  }
}
export default function (state = initialState, action) {
  switch (action.type) {
    case SET_CURRENT_POSITION:
      return { ...state,
        currentPosition: {
          lat: action.lat,
          lng: action.lng
        }
      }
    case UPDATE_MAP_BOUNDS:
      return { ...state,
        mapBounds: {
          xmin: action.xmin,
          ymin: action.ymin,
          xmax: action.xmax,
          ymax: action.ymax
        }
      }
    default:
      return state
  }
}
