import React, { Component } from 'react'
import './searchComponent.css'
import FormService from 'services/form/formService.js'
import Input from 'components/general/forms/input/inputComponent.js'

class Search extends Component {

  state = {
    formError: null,
    scooterFields: {
      scooterId: {
        label: 'Scooter ID',
        columnSize: 2,
        attributes: {
          id: 'scooterId',
          type: 'number',
          value: ''
        }
      },
      model: {
        label: 'Model',
        columnSize: 6,
        attributes: {
          id: 'model',
          type: 'text',
          maxLength: '100',
          value: ''
        }
      },
      color: {
        label: 'Color',
        columnSize: 2,
        attributes: {
          id: 'color',
          type: 'text',
          value: ''
        }
      },
      weight: {
        label: 'Weight (lbs)',
        columnSize: 2,
        attributes: {
          id: 'weight',
          type: 'text',
          maxLength: '10',
          value: ''
        }
      }
    },
    accountFields: {
      accountId: {
        label: 'Account ID',
        columnSize: 2,
        attributes: {
          id: 'accountId',
          type: 'number',
          value: ''
        }
      },
      firstName: {
        label: 'First Name',
        columnSize: 3,
        attributes: {
          id: 'model',
          type: 'text',
          value: ''
        }
      },
      lastName: {
        label: 'Last name',
        columnSize: 3,
        attributes: {
          id: 'lastName',
          type: 'text',
          value: ''
        }
      },
      email: {
        label: 'Email',
        columnSize: 4,
        attributes: {
          id: 'email',
          type: 'email',
          value: ''
        }
      }
    }
  }

  onFieldChange = (e, fieldId, sectionKey) => {
    const newFields = FormService.updateFieldValue({
      fieldId,
      newValue: e.target.value,
      fieldsMap: this.state[sectionKey]
    })

    this.setState({ ...this.state, [sectionKey]: newFields })
  }

  resetForm = () => {
    const newScooterFields = FormService.resetFieldValuesAndMessages(this.state.scooterFields)
    const newAccountFields = FormService.resetFieldValuesAndMessages(this.state.accountFields)

    this.setState({ ...this.state,
      scooterFields: newScooterFields,
      accountFields: newAccountFields,
      formError: null
    })
  }

  submitForm = (e) => {
    e.preventDefault()

    const where = {
      scooterId: this.state.scooterFields.scooterId.attributes.value || undefined,
      model: this.state.scooterFields.model.attributes.value || undefined,
      color: this.state.scooterFields.color.attributes.value || undefined,
      weight: this.state.scooterFields.weight.attributes.value || undefined,
      accountId: this.state.accountFields.accountId.attributes.value || undefined,
      firstName: this.state.accountFields.firstName.attributes.value || undefined,
      lastName: this.state.accountFields.lastName.attributes.value || undefined,
      email: this.state.accountFields.email.attributes.value || undefined
    }

    this.props.getReservations(where)
  }

  render() {
    return (
      <div className="search-component">
        <form onSubmit={this.submitForm} className="form">
          <main>
            <div className="row">
              {Object.entries(this.state.scooterFields).map(([fieldId, field]) => {
                return !field.hide &&
                <Input
                  key={fieldId}
                  {...field}
                  attributes={{...field.attributes, onChange: (e) => this.onFieldChange(e, fieldId, 'scooterFields')}}
                />
              })}
            </div>
            <hr className="section-divider"/>
            <div className="row">
              {Object.entries(this.state.accountFields).map(([fieldId, field]) => {
                return !field.hide &&
                <Input
                  key={fieldId}
                  {...field}
                  attributes={{...field.attributes, onChange: (e) => this.onFieldChange(e, fieldId, 'accountFields')}}
                />
              })}
            </div>
          </main>
          <footer>
            <div className="text-right">
              <button type="reset" className="btn btn-link" onClick={this.resetForm}>reset</button>
              <button type="submit" className="btn btn-primary">
                Search <i className="fas fa-search"/>
              </button>
            </div>
            {this.state.formError && (
              <div className="row service-feedback">
                <p className="col-xs-12 color-red">{this.state.formError}</p>
              </div>
            )}
          </footer>
        </form>
      </div>
    )
  }
}

export default Search
