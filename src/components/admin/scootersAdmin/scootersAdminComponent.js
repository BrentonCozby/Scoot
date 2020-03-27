import React, { Component } from 'react'
import './scootersAdminComponent.css'
import Authorize from 'components/general/auth/authorizeComponent.js'
import ScooterService from 'services/scooter/scooterService.js'
import ReactTable from 'react-table'
import EditScooterModal from './editScooterModal/editScooterModalComponent.js'
import { sortString, sortInt } from 'utils/sort.js'
import { filterString } from 'utils/filter.js'

class ScootersAdmin extends Component {

  state = {
    scootersTableTitle: 'Scooters',
    scootersColumns: [
      {
        Header: 'ID',
        accessor: 'scooterId',
        width: 50,
        sortMethod: sortInt
      },
      {
        Header: 'Photo',
        accessor: 'photo',
        width: 100,
        sortable: false,
        filterable: false,
        Cell: cell => <img className="scooter-photo" src={cell.original.photo} alt={cell.original.model}/>
      },
      {
        Header: 'Model',
        accessor: 'model',
        minWidth: 35,
        sortMethod: sortString,
        filterMethod: (searchTerm, cell) => filterString(searchTerm.value, cell.model)
      },
      {
        Header: 'Description',
        accessor: 'description',
        minWidth: 50,
        sortable: false,
        filterMethod: (searchTerm, cell) => filterString(searchTerm.value, cell.description)
      },
      {
        Header: 'Color',
        accessor: 'color',
        minWidth: 15,
        sortMethod: sortString,
        filterMethod: (searchTerm, cell) => filterString(searchTerm.value, cell.color)
      },
      {
        Header: '',
        accessor: 'buttonsCell',
        width: 60,
        filterable: false,
        sortable: false,
        Cell: cell => {
          return (
            <div className="cell-buttons text-right">
              <button
                title="Edit"
                className="edit"
                onClick={() => this.editScooter(cell.original)}>
                <i className="fas fa-edit"/>
              </button>
              <button
                title="Delete"
                className="delete"
                onClick={() => this.deleteScooter(cell.original.scooterId)}>
                <i className="fas fa-trash-alt"/>
              </button>
            </div>
          )
        }
      }
    ],
    scootersData: []
  }

  componentDidMount() {
    this.getAllScooters()
  }

  getAllScooters = () => {
    ScooterService.getAll({
      selectFields: [
        'model',
        'photo',
        'color',
        'description',
        'geom'
      ],
      orderBy: {
        scooterId: 'desc'
      }
    }).then(res => {
      const newState = {...this.state,
        scootersData: res
      }

      this.setState(newState)
    })
  }

  editScooter = (scooter) => {
    this.setState({ editScooterModal: { scooter } })
  }

  deleteScooter = (scooterId) => {
    if (!window.confirm(`Delete scooter with scooterId: ${scooterId}?`)) {
      return
    }

    ScooterService.remove({ scooterId })
    .then(() => {
      this.getAllScooters()
    })
  }

  closeScooterModal = (options = {}) => {
    this.setState({ editScooterModal: null, newScooterModal: null })

    if (options.refreshScooters) {
      this.getAllScooters()
    }
  }

  render() {
    return (
      <Authorize authorizedRoles={['admin', 'manager']}>
        <div className="scooters-admin-component">

          {this.state.editScooterModal && (
            <EditScooterModal
              scooter={this.state.editScooterModal.scooter}
              mode="Edit"
              closeScooterModal={this.closeScooterModal}
            />
          )}

          {this.state.newScooterModal && (
            <EditScooterModal
              scooter={{}}
              mode="New"
              closeScooterModal={this.closeScooterModal}
            />
          )}

          <div className="table-container">
            <div className="row table-title-row bottom-xs">
              <div className="col-xs-8">
                <h2 className="table-title">{this.state.scootersTableTitle}</h2>
              </div>
              <div className="col-xs-4 text-right">
                <button className="btn" onClick={() => {this.setState({ newScooterModal: true })}}>
                  <i className="fas fa-plus"></i> New Scooter
                </button>
              </div>
            </div>
            <ReactTable
              columns={this.state.scootersColumns}
              data={this.state.scootersData}
              pageSizeOptions={[5, 10, 15, 20, 50, 100]}
              defaultPageSize={15}
              filterable={true}
              className="scooters-table -striped -highlight"
            />
          </div>

        </div>
      </Authorize>
    )
  }
}

export default ScootersAdmin
