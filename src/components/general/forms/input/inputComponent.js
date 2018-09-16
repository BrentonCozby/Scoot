import React from 'react'
import './inputComponent.css'
import Select from './select/selectComponent.js'
import Textarea from './textarea/textareaComponent.js'
import Date from './date/dateComponent.js'

function Input({
  label,
  attributes,
  selectOptions,
  dateValue,
  message,
  columnSize,
  render
}) {

  function renderInputElement(type) {
    if (type === 'select') {
      return <Select attributes={attributes} selectOptions={selectOptions}/>
    }

    if (type === 'textarea') {
      return <Textarea attributes={attributes}/>
    }

    if (type === 'date') {
      return <Date attributes={attributes} dateValue={dateValue}/>
    }

    return <input {...attributes}/>
  }

  if (render) {
    return render()
  }

  return (
    <div className={`input-component form-input ${columnSize ? `col-xs-${columnSize}` : ''}`}>
      {label && <label htmlFor={attributes.id || ''}>{label}</label>}
      {renderInputElement(attributes.type)}
      {message && <span className={`message ${message.type}`}>{message.text}</span>}
    </div>
  )
}

export default Input
