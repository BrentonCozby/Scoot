import React, { Component } from 'react'
import './reviewModalComponent.css'
import FormService from 'services/form/formService.js'
import Input from 'components/general/forms/input/inputComponent.js'
import ReviewService from 'services/review/reviewService.js'

class ReviewModal extends Component {

  state = {
    formError: null,
    fields: {
      rating: {
        label: 'Rating',
        columnSize: 2,
        attributes: {
          id: 'rating',
          type: 'number',
          min: 1,
          max: 5,
          required: true,
          autoFocus: true,
          value: ''
        }
      },
      text: {
        label: 'How was your experience?',
        columnSize: 12,
        attributes: {
          id: 'text',
          type: 'textarea',
          rows: 4,
          value: ''
        }
      }
    }
  }

  onFieldChange = (e, fieldId) => {
    let newValue = e.target.value
    const newFields = FormService.updateFieldValue({ fieldId, newValue, fieldsMap: this.state.fields })
    const newState = { ...this.state, fields: newFields }
    this.setState(newState)
  }

  resetForm = () => {
    const newFields = FormService.resetFieldValuesAndMessages(this.state.fields)
    this.setState({...this.state, fields: newFields, formError: null})
  }

  onBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      this.props.toggleModal()
    }
  }

  submitForm = (e) => {
    e.preventDefault()

    ReviewService.createReview({
      accountId: this.props.accountId,
      scooterId: this.props.scooterId,
      data: {
        rating: this.state.fields.rating.attributes.value || undefined,
        text: this.state.fields.text.attributes.value || undefined
      }
    })
    .then(() => {
      this.props.toggleModal()
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
      <div className="review-modal-component" onClick={this.onBackgroundClick}>
        <form onSubmit={this.submitForm} className="form">
          <header>
            <h1>Submit Review</h1>
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
              <button className="btn btn-secondary" onClick={this.props.toggleModal}>cancel</button>
              <button type="submit" className="btn btn-primary" disabled={this.state.isSubmitDisabled}>Submit</button>
            </div>
            {this.state.formError && (
              <div className="row review-feedback">
                <p className="col-xs-12 color-red">{this.state.formError}</p>
              </div>
            )}
          </footer>
        </form>
      </div>
    )
  }
}

export default ReviewModal
