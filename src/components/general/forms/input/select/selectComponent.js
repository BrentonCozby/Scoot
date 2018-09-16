import React from 'react'

function Select({
  attributes,
  selectOptions
}) {

  return (
    <select {...attributes}>
      {selectOptions.map(option => (
        <option key={option.value} value={option.value}>{option.description}</option>
      ))}
    </select>
  )
}

export default Select
