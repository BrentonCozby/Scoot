import React, { Component } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import './scooterDetailComponent.css'
import ScooterService from 'services/scooter/scooterService.js'
import to from 'utils/await-to.js'
import Rating from '../rating/ratingComponent.js'
import ReservationService from 'services/reservation/reservationService.js'
import ReviewService from 'services/review/reviewService.js'
import AuthService from 'services/auth/authService.js'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import ReviewModal from './reviewModal/reviewModalComponent.js'

class ScooterDetail extends Component {

  state = {
    scooter: {},
    selectedDates: {
      start: moment(),
      end: moment()
    },
    existingReservations: [],
    ownReservation: {},
    foreignReservation: {},
    reserveInputErrorMessages: [],
    hasEverBeenReservedByAccount: false,
    showReviewModal: false,
    alreadyReviewed: false
  }

  async componentDidMount() {
    if (!this.state.scooter.scooterId) {
      this.refreshScooterData()
    }
  }

  async refreshScooterData() {
    const [getScooterErr, scooterList] = await to(ScooterService.getWhere({
      where: {
        scooterId: this.props.match.params.scooterId
      },
      selectFields: ['scooterId', 'model', 'photo', 'avgRating', 'color', 'description']
    }))

    const scooter = { ...(getScooterErr ? {} : scooterList[0] || {})}

    this.getReservations(scooterList[0].scooterId)

    const [getReviewsErr, reviews] = await to(ReviewService.getWhere({
      where: {
        scooterId: this.props.match.params.scooterId,
        accountId: AuthService.getAuthenticatedAccount().accountId
      }
    }))

    const alreadyReviewed = getReviewsErr ? true : reviews.length > 0

    this.setState({ scooter, alreadyReviewed })
  }

  updateSelectedDates = (date, type) => {
    const newState = { ...this.state, selectedDates: { ...this.state.selectedDates } }

    newState.selectedDates[type] = date

    this.setState(newState)
  }

  getReservations = async (scooterId) => {
    const [err, existingReservations] = await to(ReservationService.getWhere({
      where: {
        accountId: AuthService.getAuthenticatedAccount().accountId,
        scooterId: parseInt(scooterId, 10),
        betweenDates: {
          min: moment().startOf('month').format('YYYY-MM-DD'),
          max: moment().endOf('month').format('YYYY-MM-DD')
        }
      },
      selectFields: ['reservationId', 'startDate', 'endDate']
    }))

    const ownReservation = (existingReservations || []).find(reservation => {
      return (
        reservation.scooterId === scooterId &&
        reservation.accountId === AuthService.getAuthenticatedAccount().accountId &&
        !moment(reservation.endDate).isBefore(moment(), 'day')
      )
    }) || {}

    const hasEverBeenReservedByAccount = existingReservations.some(reservation => {
      return (
        reservation.scooterId === scooterId &&
        reservation.accountId === AuthService.getAuthenticatedAccount().accountId
      )
    })

    const foreignReservation = (existingReservations || []).find(reservation => {
      return (
        reservation.accountId !== AuthService.getAuthenticatedAccount().accountId &&
        moment().isBetween(reservation.startDate, reservation.endDate, 'day', [])
      )
    }) || {}

    this.setState({
      existingReservations: err ? [] : existingReservations,
      ownReservation,
      foreignReservation,
      hasEverBeenReservedByAccount
    })
  }

  createReservation = async () => {
    const reserveInputErrorMessages = []
    const selectedStart = this.state.selectedDates.start
    const selectedEnd = this.state.selectedDates.end

    const isStartInPast = selectedStart.isBefore(moment(), 'day')

    if (isStartInPast) {
      reserveInputErrorMessages.push('Start date cannot be in the past.')
    }

    const isEndBeforeStart = selectedEnd.isBefore(selectedStart, 'day');

    if (isEndBeforeStart) {
      reserveInputErrorMessages.push('End Date cannot be before Start Date.')
    }

    const areSelectedDatesAvailable = this.state.existingReservations.every(r => {
      const isStartDateTaken = selectedStart.isBetween(r.startDate, r.endDate, 'day', [])
      const isEndDateTaken = selectedEnd.isBetween(r.startDate, r.endDate, 'day', [])
      const isReservationWithinSelectedRange = (
        moment(r.startDate).isBetween(selectedStart, selectedEnd, 'day', []) ||
        moment(r.startDate).isBetween(selectedStart, selectedEnd, 'day', [])
      )

      return !isStartDateTaken && !isEndDateTaken && !isReservationWithinSelectedRange
    })

    if (!areSelectedDatesAvailable) {
      reserveInputErrorMessages.push('Please select available dates only (not gray).')
    }

    this.setState({ reserveInputErrorMessages })

    if (isStartInPast || isEndBeforeStart || !areSelectedDatesAvailable) {
      return
    }

    await to(ReservationService.createReservation({
      accountId: AuthService.getAuthenticatedAccount().accountId,
      scooterId: this.state.scooter.scooterId,
      data: {
        startDate: this.state.selectedDates.start.format('YYYY-MM-DD'),
        endDate: this.state.selectedDates.end.format('YYYY-MM-DD')
      }
    }))

    this.refreshScooterData()
  }

  cancelReservation = async () => {
    if (!this.state.ownReservation.reservationId) {
      return
    }

    await to(ReservationService.deleteReservation({
      accountId: AuthService.getAuthenticatedAccount().accountId,
      reservationId: this.state.ownReservation.reservationId
    }))

    this.refreshScooterData()
  }

  toggleRewiewModal = () => {
    this.setState({ showReviewModal: !this.state.showReviewModal })
  }

  render() {
    const {
      scooter,
      ownReservation,
      foreignReservation,
      existingReservations,
      showReviewModal,
      hasEverBeenReservedByAccount,
      alreadyReviewed
    } = this.state

    if (!scooter.scooterId) {
      return <h3 className="text-center">No data available</h3>
    }

    const disableDates = []
    existingReservations.forEach(r => disableDates.push(moment(r.startDate), moment(r.endDate)))

    return (
      <div className="scooter-detail-component">
        {showReviewModal &&
          <ReviewModal
            scooterId={scooter.scooterId}
            accountId={AuthService.getAuthenticatedAccount().accountId}
            toggleModal={this.toggleRewiewModal}
          />
        }
        <h1 className="title">{scooter.model}</h1>
        <div className="row">
          <div className="col-xs-12 col-sm-4">
            <img src={scooter.photo} alt={scooter.model} className="main-photo"/>
          </div>
          <div className="col-xs-12 col-sm-8">

            {!ownReservation.accountId && foreignReservation.accountId &&
              <div>
                <p className="reserved-message">Currently Reserved</p>
              </div>
            }

            {ownReservation.accountId &&
              <div>
                <button className="btn btn-primary cancel-reservation" onClick={this.cancelReservation}>Cancel Your Reservation</button>
                <p className="available-after">Reservation ends on {moment(ownReservation.endDate).format('MMMM D')}</p>
              </div>
            }

            {!ownReservation.accountId &&
            <div className="reserve-input">
              <div className="date-field">
                <label>Start Date</label>
                <DatePicker
                    selected={this.state.selectedDates.start}
                    selectsStart
                    startDate={this.state.selectedDates.start}
                    endDate={this.state.selectedDates.end}
                    onChange={(date) => this.updateSelectedDates(date, 'start')}
                    excludeDates={disableDates}
                    className="date-input"
                />
              </div>
              <div className="date-field">
                <label>End Date</label>
                <DatePicker
                    selected={this.state.selectedDates.end}
                    selectsEnd
                    startDate={this.state.selectedDates.start}
                    endDate={this.state.selectedDates.end}
                    onChange={(date) => this.updateSelectedDates(date, 'end')}
                    excludeDates={disableDates}
                    className="date-input"
                />
              </div>
              <button className="btn btn-primary" onClick={this.createReservation}>Reserve</button>
              {this.state.reserveInputErrorMessages.map(err => (
                <p key={err} className="error-message">{err}</p>
              ))}
            </div>
            }

            {hasEverBeenReservedByAccount && !alreadyReviewed &&
              <button onClick={this.toggleRewiewModal} className="btn btn-primary">Submit Review</button>
            }

          </div>
          <div className="col-xs-12">
            {scooter.reviewCount > 0 && <Rating rating={scooter.avgRating} reviewCount={scooter.reviewCount} />}
            <div className="text-container">
              <ul className="bullet-points">
                <li>• Color: {scooter.color}</li>
              </ul>
              <p className="description">{scooter.description}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ScooterDetail
