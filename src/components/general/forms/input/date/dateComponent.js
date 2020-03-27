import React from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import './dateComponent.css'
import DatePicker from 'react-datepicker'

function Date({
  attributes,
  dateValue
}) {

  const datePickerProps = {...attributes}
  delete datePickerProps.value

  return (
    <DatePicker
      className="date-component"
      popperClassName="date-component-popper"
      selected={dateValue}
      {...datePickerProps}
    />
  )
}

export default Date
