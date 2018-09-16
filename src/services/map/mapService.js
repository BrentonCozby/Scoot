import React from 'react'
import ReactDOM from 'react-dom'
import ScooterMapPopup from 'components/scooters/scooterMap/scooterMapPopup/scooterMapPopupComponent.js'
import { dequeue, enqueue } from '../loading/loadingService.js'

const existingMarkers = {
  currentPosition: null,
  scooters: []
}

export function getCurrentPosition() {
  enqueue(['getCurrentPosition'])

  return new Promise((resolve, reject) => {
    if (navigator && navigator.geolocation) {
      const success = function (position) {
        dequeue(['getCurrentPosition'])
        resolve({
          lng: position.coords.longitude,
          lat: position.coords.latitude
        })
      }

      const error = function (err) {
        return Promise.reject(err)
      }

      navigator.geolocation.getCurrentPosition(success, error)
    } else {
      dequeue(['getCurrentPosition'])
      resolve(null)
    }
  })
}

const markerIcons = {
  redMarker: '/images/icons/red-map-marker.png',
  scooter: '/images/icons/scooter.png'
}

export function createCurrentPositionMarker({ map, currentPosition }) {
  if (existingMarkers.currentPosition && existingMarkers.currentPosition.hasOwnProperty('setMap')) {
    existingMarkers.currentPosition.setMap(null)
    window.google.maps.event.clearInstanceListeners(existingMarkers.currentPosition)
  }

  existingMarkers.currentPosition = new window.google.maps.Marker({
    map,
    position: currentPosition,
    icon: markerIcons.redMarker
  })
}

export function createScooterMarkers({ map, scooterList }) {
  const bounds = new window.google.maps.LatLngBounds()
  const infoWindow = new window.google.maps.InfoWindow()

  existingMarkers.scooters.forEach(marker => {
    marker.setMap(null)
    window.google.maps.event.clearInstanceListeners(marker)
  })
  existingMarkers.scooters = []

  const newScooterMarkers = scooterList.map(scooter => {
    const position = { lng: scooter.lng, lat: scooter.lat }

    bounds.extend(position)

    const marker = new window.google.maps.Marker({
      map,
      position,
      icon: markerIcons.scooter
    })

    marker.scooter = scooter

    return marker
  })

  newScooterMarkers.forEach(marker => {
    marker.addListener('click', function () {
      const { scooter } = this

      var popupElement = document.createElement('div');
      ReactDOM.render(<ScooterMapPopup scooter={scooter}/>, popupElement );

      infoWindow.setContent(popupElement)
      infoWindow.open(map, this)
    })
  })

  existingMarkers.scooters = newScooterMarkers
}

export function makeMap({ mapElement, mapOptions }) {
  return new window.google.maps.Map(mapElement, mapOptions)
}

export function getDistance(lat1, lon1, lat2, lon2, unit) {
  // https://www.geodatasource.com/developers/javascript
  var radlat1 = Math.PI * lat1 / 180
  var radlat2 = Math.PI * lat2 / 180
  var theta = lon1 - lon2
  var radtheta = Math.PI * theta / 180
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

  if (dist > 1) {
    dist = 1;
  }

  dist = Math.acos(dist)
  dist = dist * 180 / Math.PI
  dist = dist * 60 * 1.1515

  if (unit === "K") {
    dist = dist * 1.609344
  }

  if (unit === "N") {
    dist = dist * 0.8684
  }

  return dist
}

export default {
  getCurrentPosition,
  createCurrentPositionMarker,
  createScooterMarkers,
  makeMap,
  getDistance
}
