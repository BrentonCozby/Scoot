import React, { Component } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import './scooterFiltersComponent.css'
import FormService from 'services/form/formService.js'
import Input from 'components/general/forms/input/inputComponent.js'
import moment from 'moment'

class ScooterFilters extends Component {

  state = {
    showFilters: false,
    fields: {
      startDate: {
        label: 'Start Date',
        columnSize: 2,
        dateValue: moment(),
        attributes: {
          id: 'startDate',
          type: 'date',
          selectsStart: true
        }
      },
      endDate: {
        label: 'End Date',
        columnSize: 2,
        dateValue: moment(),
        attributes: {
          id: 'endDate',
          type: 'date',
          selectsEnd: true
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
      model: {
        label: 'Model',
        columnSize: 2,
        attributes: {
          id: 'model',
          type: 'text',
          value: ''
        }
      },
      weight: {
        label: 'Weight',
        columnSize: 2,
        attributes: {
          id: 'weight',
          type: 'number',
          value: ''
        }
      },
      avgRating: {
        label: 'Rating',
        columnSize: 2,
        attributes: {
          id: 'avgRating',
          type: 'text',
          value: ''
        }
      }
    }
  }

  componentDidMount() {
    this.setState({...this.state,
      fields: {...this.state.fields,
        startDate: {...this.state.fields.startDate,
          attributes: {...this.state.fields.startDate.attributes,
            startDate: this.state.fields.startDate.dateValue,
            endDate: this.state.fields.endDate.dateValue
          }
        },
        endDate: {...this.state.fields.endDate,
          attributes: {...this.state.fields.endDate.attributes,
            startDate: this.state.fields.startDate.dateValue,
            endDate: this.state.fields.endDate.dateValue
          }
        }
      }
    })
  }

  toggleFilters = () => {
    this.setState({ showFilters: !this.state.showFilters })
  }

  onFieldChange = (e, fieldId, field) => {
    let newFields

    if (field.attributes.type === 'date') {
      newFields = FormService.updateDateFieldValue({ fieldId, newValue: e, fieldsMap: this.state.fields })
    } else {
      newFields = FormService.updateFieldValue({ fieldId, newValue: e.target.value, fieldsMap: this.state.fields })
    }

    const newState = { ...this.state, fields: newFields }
    this.setState(newState)
  }

  resetForm = () => {
    const newFields = FormService.resetFieldValuesAndMessages(this.state.fields)

    newFields.startDate.dateValue = null;
    newFields.endDate.dateValue = null;

    this.setState({...this.state, fields: newFields, formError: null})
  }

  filterScooters = () => {
    const filters = {
      color: this.state.fields.color.attributes.value || undefined,
      model: this.state.fields.model.attributes.value || undefined,
      weight: this.state.fields.weight.attributes.value || undefined
    }

    if (moment(this.state.fields.startDate.dateValue).isValid() && moment(this.state.fields.endDate.dateValue).isValid()) {
      filters.availableBetween = {
        min: this.state.fields.startDate.dateValue.format('YYYY-MM-DD'),
        max: this.state.fields.endDate.dateValue.format('YYYY-MM-DD')
      }
    }

    this.props.updateScooterList({ filters })
  }

  render() {
    const { showFilters } = this.state

    return (
      <div className="scooter-filters-component">
        {showFilters &&
        <div className="fields-container">
          <div className="row">
            {Object.entries(this.state.fields).map(([fieldId, field]) => {
              return !field.hide &&
              <Input
                key={fieldId}
                {...field}
                attributes={{...field.attributes, onChange: (e) => this.onFieldChange(e, fieldId, field)}}
              />
            })}
          </div>
        </div>
        }
        <div className="buttons-row">
          {this.state.showFilters && (
            <React.Fragment>
              <button className="btn btn-secondary" type="reset" onClick={this.resetForm}>
                Reset
              </button>
              <button className="btn btn-primary" type="submit" onClick={this.filterScooters}>
                Filter
              </button>
            </React.Fragment>
          )}
          <button className="toggle-filters btn btn-secondary" onClick={this.toggleFilters}>
            {this.state.showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>
    )
  }
}

export default ScooterFilters
