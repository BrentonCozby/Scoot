import React, { Component } from 'react'
import './reservationsAdminComponent.css'
import Authorize from 'components/general/auth/authorizeComponent.js'
import ReservationService from 'services/reservation/reservationService.js'
import to from 'utils/await-to.js'
import ReactTable from 'react-table'
import moment from 'moment'
import Search from './search/searchComponent.js'
import { sortString, sortInt } from 'utils/sort.js'
import { filterString } from 'utils/filter.js'

class ReservationsAdmin extends Component {

  state = {
    tableTitle: 'Reservations',
    columns: [
      {
        Header: 'Photo',
        accessor: 'photo',
        width: 100,
        filterable: false,
        sortable: false,
        Cell: cell => <img className="scooter-photo" src={cell.original.photo} alt={cell.original.model} />
      },
      {
        Header: 'Model',
        accessor: 'model',
        minWidth: 50,
        sortMethod: sortString,
        filterMethod: (searchTerm, cell) => filterString(searchTerm.value, cell.model)
      },
      {
        Header: 'Start',
        accessor: 'startDate',
        minWidth: 25,
        Cell: cell => moment(cell.original.startDate).format('MM/DD/YYYY'),
        sortMethod: (a, b) => sortInt(new Date(a).getTime(), new Date(b).getTime()),
        filterMethod: (searchTerm, cell) => filterString(searchTerm.value, moment(cell.startDate).format('MM/DD/YYYY'))
      },
      {
        Header: 'End',
        accessor: 'endDate',
        minWidth: 25,
        Cell: cell => moment(cell.original.endDate).format('MM/DD/YYYY'),
        sortMethod: (a, b) => sortInt(new Date(a).getTime(), new Date(b).getTime()),
        filterMethod: (searchTerm, cell) => filterString(searchTerm.value, moment(cell.endDate).format('MM/DD/YYYY'))
      },
      {
        Header: 'Name',
        accessor: 'fullName',
        minWidth: 30,
        Cell: cell => `${cell.original.lastName}, ${cell.original.firstName}`,
        sortMethod: sortString,
        filterMethod: (searchTerm, cell) => filterString(searchTerm.value, `${cell._original.lastName}, ${cell._original.firstName}`),
        show: !this.props.match.params.accountId
      },
      {
        Header: '',
        accessor: 'buttonsCell',
        width: 32,
        filterable: false,
        sortable: false,
        Cell: cell => {
          return (
            <div className="cell-buttons text-right">
              <button
                title="Delete"
                className="delete"
                onClick={() => this.deleteReservation(cell.original.reservationId)}>
                <i className="fas fa-trash-alt"/>
              </button>
            </div>
          )
        }
      }
    ],
    reservations: [],
    showSearch: false
  }

  componentDidMount() {
    const { accountId, scooterId } = this.props.match.params

    this.getReservations({ accountId, scooterId })
  }

  getReservations = async (where = {}) => {
    const [err, reservations] = await to(ReservationService.getWhere({
      where,
      selectFields: ['startDate', 'endDate', 'photo', 'model', 'firstName', 'lastName'],
      orderBy: {
        endDate: 'desc'
      }
    }))

    const { accountId, scooterId } = where
    let tableTitle = 'Reservations'

    if (reservations && reservations[0]) {
      if (accountId && !scooterId) {
        tableTitle = `Reservations for ${reservations[0].firstName} ${reservations[0].lastName}`
      } else if (scooterId && !accountId) {
        tableTitle = `Reservations for Scooter with ID: ${scooterId}`
      } else if (accountId && scooterId) {
        tableTitle = `Reservations for ${reservations[0].firstName} ${reservations[0].lastName} with Scooter ID: ${scooterId}`
      }
    }

    this.setState({
      reservations: err ? [] : reservations,
      tableTitle
    })
  }

  deleteReservation = (reservationId) => {
    if (!window.confirm(`Delete reservation with reservationId: ${reservationId}?`)) {
      return
    }

    ReservationService.deleteReservation({ reservationId })
    .then(() => {
      const { accountId, scooterId } = this.props.match.params

      this.getReservations({ accountId, scooterId })
    })
  }

  toggleSearch = () => {
    this.setState({ showSearch: !this.state.showSearch })
  }

  render() {
    return (
      <Authorize authorizedRoles={['admin', 'manager']}>
        <div className="reservations-admin-component">

          <div className="table-container">
            <div className="row table-title-row bottom-xs">
              <div className="col-xs-8">
                <h2 className="table-title">{this.state.tableTitle}</h2>
              </div>
              <div className="col-xs-4 text-right">
                <button className="btn btn-secondary" onClick={this.toggleSearch}>
                  {this.state.showSearch ? 'Hide' : 'Show'} Search
                </button>
              </div>
            </div>
            {this.state.showSearch &&
              <Search getReservations={this.getReservations}/>
            }
            <ReactTable
              columns={this.state.columns}
              data={this.state.reservations}
              pageSizeOptions={[5, 10, 15, 20, 50, 100]}
              defaultPageSize={15}
              filterable={true}
              className="reservations-table -striped -highlight"
            />
          </div>

        </div>
      </Authorize>
    )
  }
}

export default ReservationsAdmin
