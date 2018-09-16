import React, { Component } from 'react'
import './loginComponent.css'
import { Link } from 'react-router-dom'
import AuthService from 'services/auth/authService.js'
import Input from 'components/general/forms/input/inputComponent.js'
import FormService from 'services/form/formService.js'

class Login extends Component {

  state = {
    formError: null,
    fields: {
      email: {
        label: 'Email',
        columnSize: 12,
        attributes: {
          id: 'email',
          type: 'email',
          maxLength: '100',
          required: true,
          autoFocus: true,
          value: ''
        }
      },
      password: {
        label: 'Password',
        columnSize: 12,
        attributes: {
          id: 'password',
          type: 'password',
          maxLength: '40',
          required: true,
          value: ''
        }
      }
    }
  }

  resetForm = () => {
    const newFields = FormService.resetFieldValuesAndMessages(this.state.fields)

    this.setState({...this.state, fields: newFields})
  }

  onFieldChange = (e, fieldId) => {
    const newFields = FormService.updateFieldValue({ fieldId, newValue: e.target.value, fieldsMap: this.state.fields })

    this.setState({ ...this.state, fields: newFields })
  }

  submitLoginForm = (e) => {
    e.preventDefault()

    AuthService.login({
      email: document.querySelector('#email').value,
      password: document.querySelector('#password').value
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
      <div className="login-component">
        <form onSubmit={this.submitLoginForm} className="form login-form">
          <header>
            <h1>Login</h1>
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
              <Link className="btn btn-secondary" to="/sign-up">Sign Up</Link>
              <button type="submit" className="btn btn-primary">Submit</button>
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

export default Login
