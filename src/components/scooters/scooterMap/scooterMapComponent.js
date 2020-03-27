import React, { Component } from 'react'
import './scooterMapComponent.css'
import MapService from 'services/map/mapService.js'
import { connect } from 'react-redux'
import { updateCurrentPosition, updateMapBounds } from 'store/actions/index.js'
import debounce from 'lodash.debounce'

class ScooterMap extends Component {

  state = {
    map: null
  }

  componentDidMount() {
    // this.props.updateCurrentPosition()

    const defaultMapOptions = {
      center: {
        lat: this.props.currentPosition.lat,
        lng: this.props.currentPosition.lng
      },
      zoom: 14,
      gestureHandling: 'cooperative'
    }

    const map = MapService.makeMap({
      mapElement: document.getElementById(this.props.mapId),
      mapOptions: this.props.mapOptions || defaultMapOptions
    })

    map.addListener('bounds_changed', debounce(() => {
      const bounds = map.getBounds()
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()

      const xmin = sw.lng()
      const ymin = sw.lat()
      const xmax = ne.lng()
      const ymax = ne.lat()

      this.props.updateMapBounds({ xmin, ymin, xmax, ymax })
    }, 300))

    this.setState({ map })

    this.createScooterMarkers({ map })
    this.createCurrentPositionMarker({ map })
  }

  componentWillUnmount = () => {
    window.google.maps.event.clearInstanceListeners(this.state.map)
  }

  componentDidUpdate(prevProps) {
    const scooterListChanged = Boolean(
      this.props.scooterList.length !== prevProps.scooterList.length ||
      this.props.scooterList.some((scooter, index) => {
        return scooter.scooterId !== prevProps.scooterList[index].scooterId
      })
    )

    const currentPositionChanged = Boolean(
      this.props.currentPosition.lat !== prevProps.currentPosition.lat ||
      this.props.currentPosition.lng !== prevProps.currentPosition.lng
    )

    if (scooterListChanged) {
      this.createScooterMarkers({})
    }

    if (currentPositionChanged) {
      this.createCurrentPositionMarker({})
    }
  }

  createScooterMarkers = ({
    map = this.state.map,
    scooterList = this.props.scooterList,
    currentPosition = this.props.currentPosition
  }) => {
    if (!map) {
      return
    }

    MapService.createScooterMarkers({ map, scooterList, currentPosition })
  }

  createCurrentPositionMarker = ({
    map = this.state.map,
    scooterList = this.props.scooterList,
    currentPosition = this.props.currentPosition
  }) => {
    if (!map) {
      return
    }

    MapService.createCurrentPositionMarker({ map, scooterList, currentPosition })

    if (map.panTo) {
      map.panTo({
        lat: currentPosition.lat,
        lng: currentPosition.lng
      })
    }
  }

  render() {
    return (
      <div className="scooter-map-component" id={`${this.props.mapId}`}/>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    currentPosition: state.map.currentPosition,
    scooterList: state.scooterList.list
  }
}

const mapDispatchToProps = {
  updateCurrentPosition,
  updateMapBounds
}

export default connect(mapStateToProps, mapDispatchToProps)(ScooterMap)
