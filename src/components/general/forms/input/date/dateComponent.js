import React from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import './dateComponent.css'
import DatePicker from 'react-datepicker'

function Date({
  attributes,
  dateValue
}) {

  return (
    <DatePicker
      className="date-component"
      popperClassName="date-component-popper"
      selected={dateValue}
      {...attributes}
    />
  )
}

export default Date
