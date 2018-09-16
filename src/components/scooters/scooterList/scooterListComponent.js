import React, { Component } from 'react'
import './scooterListComponent.css'
import ScooterPreview from '../scooterPreview/scooterPreviewComponent.js'
import ScooterFiltersComponent from '../scooterFilters/scooterFiltersComponent.js'
import { connect } from 'react-redux'
import { updateScooterList } from 'store/actions/index.js'

const DEFAULT_LIST_LIMIT = 5
const LIMIT_INCREASE = 5

class ScooterList extends Component {

  state = {
    displayedList: [],
    displayedListLimit: DEFAULT_LIST_LIMIT
  }

  async componentDidMount() {
    this.updateScooterList({})
  }

  componentDidUpdate(prevProps) {
    const currentPositionChanged = Boolean(
      this.props.currentPosition.lat !== prevProps.currentPosition.lat ||
      this.props.currentPosition.lng !== prevProps.currentPosition.lng
    )
    const mapBoundsChanged = Boolean(
      this.props.mapBounds.xmin !== prevProps.mapBounds.xmin ||
      this.props.mapBounds.ymin !== prevProps.mapBounds.ymin ||
      this.props.mapBounds.xmax !== prevProps.mapBounds.xmax ||
      this.props.mapBounds.ymax !== prevProps.mapBounds.ymax
    )
    const scooterListChanged = Boolean(
      this.props.scooterList.length !== prevProps.scooterList.length ||
      this.props.scooterList.some((scooter, index) => {
        return scooter.scooterId !== prevProps.scooterList[index].scooterId
      })
    )

    if (currentPositionChanged || mapBoundsChanged) {
      this.updateScooterList({})
    }

    if (scooterListChanged) {
      this.updateDisplayedList({ resetLimit: true })
    }
  }

  updateScooterList = ({ filters }) => {
    this.props.updateScooterList({
      where: {
        bounds: this.props.mapBounds,
        ...(filters || {})
      },
      distanceFrom: {
        lat: this.props.currentPosition.lat,
        lng: this.props.currentPosition.lng
      },
      selectFields: ['scooter_id', 'model', 'photo', 'description', 'color', 'avgRating', 'geom'],
      orderBy: {
        distance: 'asc'
      }
    })
  }

  updateDisplayedList = ({
    increaseLimit,
    resetLimit
  }) => {
    const displayedListLimit = resetLimit
      ? DEFAULT_LIST_LIMIT
      : this.state.displayedListLimit + (increaseLimit ? LIMIT_INCREASE : 0)

    const newDisplayedList = this.props.scooterList.slice(0, displayedListLimit)

    this.setState({
      displayedList: newDisplayedList,
      displayedListLimit
    })
  }

  showMoreScooters = () => {
    this.updateDisplayedList({ increaseLimit: true })
  }

  render() {
    const { displayedList } = this.state

    return (
      <div className="scooter-list-component">
        <ScooterFiltersComponent updateScooterList={this.updateScooterList}/>
        <div className="row">
          <div className="col-xs-12">
            {displayedList.length > 0 && displayedList.map(scooter => (
              <ScooterPreview scooter={scooter} key={scooter.scooterId}/>
            ))}
          </div>
          <div className="col-xs-12 text-center">
            {this.props.scooterList.length > displayedList.length &&
              <button className="btn btn-secondary view-more" onClick={this.showMoreScooters}>Show More</button>
            }
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    currentPosition: state.map.currentPosition,
    mapBounds: state.map.mapBounds,
    scooterList: state.scooterList.list
  }
}

const mapDispatchToProps = {
  updateScooterList
}

export default connect(mapStateToProps, mapDispatchToProps)(ScooterList)
