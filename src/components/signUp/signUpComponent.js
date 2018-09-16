import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import './signUpComponent.css'
import AccountService from 'services/account/accountService.js'
import AuthService from 'services/auth/authService.js'
import Input from 'components/general/forms/input/inputComponent.js'
import FormService from 'services/form/formService.js'

class SignUp extends Component {

  state = {
    isSubmitDisabled: true,
    formError: null,
    fields: {
      firstName: {
        label: 'First Name',
        columnSize: 6,
        attributes: {
          id: 'firstName',
          type: 'text',
          maxLength: '40',
          required: true,
          autoFocus: true,
          value: ''
        }
      },
      lastName: {
        label: 'Last Name',
        columnSize: 6,
        attributes: {
          id: 'lastName',
          type: 'text',
          maxLength: '40',
          required: true,
          value: ''
        }
      },
      email: {
        label: 'Email',
        columnSize: 12,
        attributes: {
          id: 'email',
          type: 'email',
          maxLength: '100',
          required: true,
          value: ''
        }
      },
      roles: {
        label: 'Roles',
        columnSize: 12,
        attributes: {
          id: 'roles',
          type: 'select',
          value: ''
        },
        selectOptions: [
          { value: '', description: '' },
          { value: 'admin', description: 'Admin' },
          { value: 'manager', description: 'Manager' }
        ]
      },
      password: {
        label: 'Password',
        columnSize: 6,
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

  onFieldChange = (e, fieldId) => {
    const newFields = FormService.updateFieldValue({ fieldId, newValue: e.target.value, fieldsMap: this.state.fields })

    const passwordField = document.querySelector('#password')
    const confirmPasswordField = document.querySelector('#confirmPassword')

    const newState = { ...this.state, fields: newFields }

    if (passwordField.value && passwordField.value !== confirmPasswordField.value) {
      newState.isSubmitDisabled = true

      newState.fields.confirmPassword.message = {
        type: 'error',
        text: 'Passwords don\'t match'
      }
    } else if (!passwordField.value) {
      newState.isSubmitDisabled = true
      newState.fields.confirmPassword.message = null
    } else {
      newState.isSubmitDisabled = false
      newState.fields.confirmPassword.message = null
    }

    this.setState(newState)
  }

  resetForm = () => {
    const newFields = FormService.resetFieldValuesAndMessages(this.state.fields)

    this.setState({...this.state, fields: newFields, formError: null})
  }

  submitSignUpForm = (e) => {
    e.preventDefault()

    AccountService.createAccount({
      firstName: this.state.fields.firstName.attributes.value,
      lastName: this.state.fields.lastName.attributes.value,
      roles: this.state.fields.roles.attributes.value,
      email: this.state.fields.email.attributes.value,
      password: this.state.fields.password.attributes.value
    })
    .then(() => {
      return AuthService.login({
        email: document.querySelector('#email').value,
        password: document.querySelector('#password').value
      })
    })
    .catch(err => {
      if (err.messageMap) {
        this.setState({
          fields: FormService.setFieldMessages(this.state.fields, err.messageMap, 'error')
        })
      } else {
        this.setState({ formError: err.message || err })
      }
    })
  }

  render() {
    return (
      <div className="sign-up-component">
        <form onSubmit={this.submitSignUpForm} className="form sign-up-form">
          <header>
            <h1>Sign Up</h1>
          </header>
          <hr/>
          <main>
            <div className="row">
              {Object.entries(this.state.fields).map(([fieldId, field]) => (
                <Input
                  key={fieldId}
                  {...field}
                  attributes={{...field.attributes, onChange: (e) => this.onFieldChange(e, fieldId)}}
                />
              ))}
            </div>
          </main>
          <footer>
            <div>
              <button type="reset" className="btn btn-link" onClick={this.resetForm}>reset</button>
              <Link className="btn btn-secondary" to="/login">Login</Link>
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

export default SignUp
