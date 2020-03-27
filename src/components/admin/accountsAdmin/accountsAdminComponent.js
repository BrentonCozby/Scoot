import React, { Component } from 'react'
import './accountsAdminComponent.css'
import Authorize from 'components/general/auth/authorizeComponent.js'
import AccountService from 'services/account/accountService.js'
import ReactTable from 'react-table'
import EditAccountModal from './editAccountModal/editAccountModalComponent.js'
import { Link } from 'react-router-dom'
import { sortString, sortInt } from 'utils/sort.js'
import { filterString } from 'utils/filter.js'

class AccountsAdmin extends Component {

  state = {
    accountsTableTitle: 'Accounts',
    accountsColumns: [
      {
        Header: 'ID',
        accessor: 'accountId',
        width: 50,
        sortMethod: sortInt
      },
      {
        Header: 'First Name',
        accessor: 'firstName',
        minWidth: 35,
        sortMethod: sortString,
        filterMethod: (searchTerm, cell) => filterString(searchTerm.value, cell.firstName)
      },
      {
        Header: 'Last Name',
        accessor: 'lastName',
        minWidth: 35,
        sortMethod: sortString,
        filterMethod: (searchTerm, cell) => filterString(searchTerm.value, cell.lastName)
      },
      {
        Header: 'Email',
        accessor: 'email',
        minWidth: 50,
        sortMethod: sortString,
        filterMethod: (searchTerm, cell) => filterString(searchTerm.value, cell.email)
      },
      {
        Header: 'Roles',
        accessor: 'roles',
        minWidth: 30,
        sortMethod: sortString,
        filterMethod: (searchTerm, cell) => filterString(searchTerm.value, cell.roles || '')
      },
      {
        Header: '',
        accessor: 'buttonsCell',
        width: 80,
        filterable: false,
        sortable: false,
        Cell: cell => {
          return (
            <div className="cell-buttons text-right">
              <Link to={`/admin/reservations/accounts/${cell.original.accountId}`}>
                <button
                  title="View Reservations"
                  className="view-reservations">
                  <i className="fas fa-calendar-check"/>
                </button>
              </Link>
              <button
                title="Edit"
                className="edit"
                onClick={() => this.editAccount(cell.original)}>
                <i className="fas fa-edit"/>
              </button>
              <button
                title="Delete"
                className="delete"
                onClick={() => this.deleteAccount(cell.original.accountId)}>
                <i className="fas fa-trash-alt"/>
              </button>
            </div>
          )
        }
      }
    ],
    accountsData: []
  }

  componentDidMount() {
    this.getAllAccounts()
  }

  getAllAccounts = () => {
    AccountService.getAll({
      selectFields: ['firstName', 'lastName', 'email', 'roles'],
      orderBy: {
        lastName: 'asc'
      }
    }).then(res => {
      const newState = {...this.state,
        accountsData: res
      }

      this.setState(newState)
    })
  }

  editAccount = (account) => {
    this.setState({ editAccountModal: { account } })
  }

  deleteAccount = (accountId) => {
    if (!window.confirm(`Delete account with accountId: ${accountId}?`)) {
      return
    }

    AccountService.remove({ accountId })
    .then(() => {
      this.getAllAccounts()
    })
  }

  closeAccountModal = (options = {}) => {
    this.setState({ editAccountModal: null, newAccountModal: null })

    if (options.refreshAccounts) {
      this.getAllAccounts()
    }
  }

  render() {
    return (
      <Authorize authorizedRoles={['admin', 'manager']}>
        <div className="accounts-admin-component">

          {this.state.editAccountModal && (
            <EditAccountModal
              account={this.state.editAccountModal.account}
              mode="Edit"
              closeAccountModal={this.closeAccountModal}
            />
          )}

          {this.state.newAccountModal && (
            <EditAccountModal
              account={{}}
              mode="New"
              closeAccountModal={this.closeAccountModal}
            />
          )}

          <div className="table-container">
            <div className="row table-title-row bottom-xs">
              <div className="col-xs-8">
                <h2 className="table-title">{this.state.accountsTableTitle}</h2>
              </div>
              <div className="col-xs-4 text-right">
                <button className="btn" onClick={() => {this.setState({ newAccountModal: true })}}>
                  <i className="fas fa-plus"></i> New Account
                </button>
              </div>
            </div>
            <ReactTable
              columns={this.state.accountsColumns}
              data={this.state.accountsData}
              pageSizeOptions={[5, 10, 15, 20, 50, 100]}
              defaultPageSize={15}
              filterable={true}
              className="accounts-table -striped -highlight"
            />
          </div>

        </div>
      </Authorize>
    )
  }
}

export default AccountsAdmin
