import React, { Component } from 'react'
import './editAccountModalComponent.css'
import FormService from 'services/form/formService.js'
import Input from 'components/general/forms/input/inputComponent.js'
import AccountService from 'services/account/accountService.js'

class EditAccountModal extends Component {

  state = {
    formError: null,
    fields: {
      accountId: {
        label: 'Account ID',
        columnSize: 4,
        hide: true,
        attributes: {
          id: 'accountId',
          type: 'number',
          required: true,
          value: this.props.account.accountId || '',
          disabled: true
        }
      },
      firstName: {
        label: 'First Name',
        columnSize: 4,
        attributes: {
          id: 'firstName',
          type: 'text',
          maxLength: '40',
          required: true,
          autoFocus: true,
          value: this.props.account.firstName || ''
        }
      },
      lastName: {
        label: 'Last Name',
        columnSize: 4,
        attributes: {
          id: 'lastName',
          type: 'text',
          maxLength: '40',
          required: true,
          value: this.props.account.lastName || ''
        }
      },
      email: {
        label: 'Email',
        columnSize: 6,
        attributes: {
          id: 'email',
          type: 'email',
          maxLength: '100',
          required: true,
          value: this.props.account.email || ''
        }
      },
      roles: {
        label: 'Roles',
        columnSize: 6,
        attributes: {
          id: 'roles',
          type: 'text',
          maxLength: '100',
          value: this.props.account.roles || ''
        }
      },
      password: {
        label: 'Password',
        columnSize: 6,
        hide: true,
        attributes: {
          id: 'password',
          type: 'password',
          maxLength: '40',
          required: true,
          value: ''
        }
      },
      confirmPassword: {
        label: 'Confirm Password',
        columnSize: 6,
        hide: true,
        attributes: {
          id: 'confirmPassword',
          type: 'password',
          maxLength: '40',
          required: true,
          value: ''
        }
      }
    }
  }

  componentDidMount() {
    if (this.props.mode === 'New') {
      this.setState(prevState => ({
        isSubmitDisabled: true,
        fields: {...prevState.fields,
          password: {...prevState.fields.password,
            hide: false
          },
          confirmPassword: {...prevState.fields.confirmPassword,
            hide: false
          }
        }
      }))
    }
  }

  onFieldChange = (e, fieldId) => {
    const newFields = FormService.updateFieldValue({ fieldId, newValue: e.target.value, fieldsMap: this.state.fields })

    const newState = { ...this.state, fields: newFields }

    const passwordField = document.querySelector('#password')
    const confirmPasswordField = document.querySelector('#confirmPassword')

    if (passwordField && confirmPasswordField) {
      this.verifyPasswords(newState, passwordField, confirmPasswordField)
    }

    this.setState(newState)
  }

  verifyPasswords = (state, passwordField, confirmPasswordField) => {
    if (passwordField.value && passwordField.value !== confirmPasswordField.value) {
      state.isSubmitDisabled = true

      state.fields.confirmPassword.message = {
        type: 'error',
        text: 'Passwords don\'t match'
      }
    } else if (!passwordField.value) {
      state.isSubmitDisabled = true
      state.fields.confirmPassword.message = null
    } else {
      state.isSubmitDisabled = false
      state.fields.confirmPassword.message = null
    }
  }

  resetForm = () => {
    const newFields = FormService.resetFieldValuesAndMessages(this.state.fields)

    this.setState({...this.state, fields: newFields, formError: null})
  }

  onBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      this.props.closeAccountModal()
    }
  }

  submitForm = (e) => {
    e.preventDefault()

    const accountData = {
      accountId: this.state.fields.accountId.attributes.value,
      firstName: this.state.fields.firstName.attributes.value,
      lastName: this.state.fields.lastName.attributes.value,
      email: this.state.fields.email.attributes.value,
      roles: this.state.fields.roles.attributes.value,
      password: this.state.fields.password.attributes.value
    }

    if (this.props.mode === 'New') {
      this.saveNewAccount(accountData)
    }

    if (this.props.mode === 'Edit') {
      this.saveEditedAccount(accountData)
    }
  }

  saveNewAccount = (accountData) => {
    AccountService.createAccount({ ...accountData })
    .then(() => {
      this.props.closeAccountModal({ refreshAccounts: true })
    })
    .catch(err => {
      if (err.requestBodyErrors) {
        this.setState({
          fields: FormService.setFieldMessages(this.state.fields, err.requestBodyErrors, 'error')
        })
      } else {
        this.setState({ formError: err.message || err })
      }
    })
  }

  saveEditedAccount = (accountData) => {
    AccountService.editAccount({ accountId: this.props.account.accountId, updateMap: accountData })
    .then(() => {
      this.props.closeAccountModal({ refreshAccounts: true })
    })
    .catch(err => {
      if (err.requestBodyErrors) {
        this.setState({
          fields: FormService.setFieldMessages(this.state.fields, err.requestBodyErrors, 'error')
        })
      } else {
        this.setState({ formError: err.message || err })
      }
    })
  }

  render() {
    return (
      <div className="editAccountModalComponent" onClick={this.onBackgroundClick}>
        <form onSubmit={this.submitForm} className="form">
          <header>
            <h1>{this.props.mode} Account</h1>
          </header>
          <hr/>
          <main>
            <div className="row">
              {Object.entries(this.state.fields).map(([fieldId, field]) => {
                return !field.hide &&
                <Input
                  key={fieldId}
                  {...field}
                  attributes={{...field.attributes, onChange: (e) => this.onFieldChange(e, fieldId)}}
                />
              })}
            </div>
          </main>
          <footer>
            <div>
              <button type="reset" className="btn btn-link" onClick={this.resetForm}>reset</button>
              <button className="btn btn-secondary" onClick={this.props.closeAccountModal}>cancel</button>
              <button type="submit" className="btn btn-primary" disabled={this.state.isSubmitDisabled}>Submit</button>
            </div>
            {this.state.formError && (
              <div className="row account-feedback">
                <p className="col-xs-12 color-red">{this.state.formError}</p>
              </div>
            )}
          </footer>
        </form>
      </div>
    )
  }
}

export default EditAccountModal
