import React, { Component } from 'react'
import './editScooterModalComponent.css'
import FormService from 'services/form/formService.js'
import Input from 'components/general/forms/input/inputComponent.js'
import ScooterService from 'services/scooter/scooterService.js'
import to from 'utils/await-to.js'

class EditScooterModal extends Component {

  state = {
    formError: null,
    fields: {
      scooterId: {
        label: 'Scooter ID',
        columnSize: 2,
        attributes: {
          id: 'scooterId',
          type: 'number',
          required: true,
          value: this.props.scooter.scooterId || '',
          disabled: true
        }
      },
      model: {
        label: 'Model',
        columnSize: 10,
        attributes: {
          id: 'model',
          type: 'text',
          maxLength: '100',
          required: true,
          autoFocus: true,
          value: this.props.scooter.model || ''
        }
      },
      photo: {
        label: 'Photo URL',
        columnSize: 6,
        attributes: {
          id: 'photo',
          type: 'text',
          required: true,
          value: this.props.scooter.photo || ''
        }
      },
      imageUpload: {
        render: () => (
          <div className="input-component form-input col-xs-6">
            <label>Upload Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => this.setImageUpload(e)}
              style={{border: 'none', paddingLeft: '0'}}
            />
          </div>
        )
      },
      color: {
        label: 'Color',
        columnSize: 3,
        attributes: {
          id: 'color',
          type: 'text',
          maxLength: '100',
          required: true,
          value: this.props.scooter.color || ''
        }
      },
      weight: {
        label: 'Weight (lbs)',
        columnSize: 3,
        attributes: {
          id: 'weight',
          type: 'text',
          maxLength: '10',
          required: true,
          value: this.props.scooter.weight || ''
        }
      },
      lat: {
        label: 'Latitude',
        columnSize: 3,
        attributes: {
          id: 'lat',
          type: 'text',
          maxLength: '11',
          required: true,
          value: this.props.scooter.lat || ''
        }
      },
      lng: {
        label: 'Longitude',
        columnSize: 3,
        attributes: {
          id: 'lng',
          type: 'text',
          maxLength: '11',
          required: true,
          value: this.props.scooter.lng || ''
        }
      },
      description: {
        label: 'Description',
        columnSize: 12,
        attributes: {
          id: 'description',
          type: 'textarea',
          required: true,
          value: this.props.scooter.description || '',
          rows: 5
        }
      }
    }
  }

  onFieldChange = (e, fieldId) => {
    const newFields = FormService.updateFieldValue({ fieldId, newValue: e.target.value, fieldsMap: this.state.fields })

    this.setState({ ...this.state, fields: newFields })
  }

  resetForm = () => {
    const newFields = FormService.resetFieldValuesAndMessages(this.state.fields)

    this.setState({...this.state, fields: newFields, formError: null})
  }

  onBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      this.props.closeScooterModal()
    }
  }

  setImageUpload = (e) => {
    const image = e.target.files[0]

    this.setState({ imageUpload: image })
  }

  submitForm = (e) => {
    e.preventDefault()

    const scooterData = {
      scooterId: this.state.fields.scooterId.attributes.value,
      model: this.state.fields.model.attributes.value,
      photo: this.state.fields.photo.attributes.value,
      color: this.state.fields.color.attributes.value,
      weight: parseFloat(this.state.fields.weight.attributes.value),
      description: this.state.fields.description.attributes.value,
      lat: parseFloat(this.state.fields.lat.attributes.value),
      lng: parseFloat(this.state.fields.lng.attributes.value)
    }

    if (this.props.mode === 'New') {
      this.saveNewScooter(scooterData)
    }

    if (this.props.mode === 'Edit') {
      this.saveEditedScooter(scooterData)
    }
  }

  saveNewScooter = async (scooterData) => {
    const [createErr] = await to(ScooterService.createScooter({ ...scooterData }))

    if (createErr) {
      if (createErr && createErr.messageMap) {
        this.setState({
          fields: FormService.setFieldMessages(this.state.fields, createErr.messageMap, 'error')
        })
      } else {
        this.setState({
          formError: createErr.message || createErr
        })
      }

      return
    }

    const [uploadErr] = await to(this.state.imageUpload
      ? ScooterService.uploadScooterImage({
        scooterId: this.state.fields.scooterId.attributes.value,
        image: this.state.imageUpload
      })
      : Promise.resolve())

    if (!uploadErr) {
      this.props.closeScooterModal({ refreshScooters: true })
    }
  }

  saveEditedScooter = async (scooterData) => {
    const [editErr] = await to(ScooterService.editScooter({
      scooterId: this.props.scooter.scooterId,
      updateMap: scooterData
    }))

    if (editErr) {
      if (editErr && editErr.messageMap) {
        this.setState({
          fields: FormService.setFieldMessages(this.state.fields, editErr.messageMap, 'error')
        })
      } else {
        this.setState({
          formError: editErr.message || editErr
        })
      }

      return
    }

    const [uploadErr] = await to(this.state.imageUpload
      ? ScooterService.uploadScooterImage({
        scooterId: this.state.fields.scooterId.attributes.value,
        image: this.state.imageUpload
      })
      : Promise.resolve())

    if (!uploadErr) {
      this.props.closeScooterModal({ refreshScooters: true })
    }
  }

  render() {
    return (
      <div className="edit-scooter-modal-component" onClick={this.onBackgroundClick}>
        <form onSubmit={this.submitForm} className="form">
          <header>
            <h1>{this.props.mode} Scooter</h1>
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
              <button className="btn btn-secondary" onClick={this.props.closeScooterModal}>cancel</button>
              <button type="submit" className="btn btn-primary" disabled={this.state.isSubmitDisabled}>Submit</button>
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

export default EditScooterModal
