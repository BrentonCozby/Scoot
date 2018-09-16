export function updateFieldValue({ fieldId, newValue, fieldsMap }) {
  return {...fieldsMap,
    [fieldId]: {...fieldsMap[fieldId],
      attributes: {...fieldsMap[fieldId].attributes,
        value: newValue
      }
    }
  }
}

export function updateDateFieldValue({ fieldId, newValue, fieldsMap }) {
  return {...fieldsMap,
    [fieldId]: {...fieldsMap[fieldId],
      dateValue: newValue,
    }
  }
}

export function resetFieldValues(fieldsMap) {
  const newFields = {...fieldsMap}

  Object.values(newFields).forEach(field => {
    field.attributes.value = ''
  })

  return newFields
}

export function resetFieldMessages(fieldsMap) {
  const newFields = {...fieldsMap}

  Object.values(newFields).forEach(field => {
    field.message = null
  })

  return newFields
}

export function resetFieldValuesAndMessages(fieldsMap) {
  const newFields = {...fieldsMap}

  Object.values(newFields).forEach(field => {
    field.attributes.value = ''
    field.message = null
  })

  return newFields
}

export function setFieldMessages(fieldsMap, messageMap, type) {
  return Object.keys(fieldsMap).reduce((newFieldsMap, fieldId) => {
    newFieldsMap[fieldId] = {...fieldsMap[fieldId]}

    if (messageMap.hasOwnProperty(fieldId)) {
      newFieldsMap[fieldId].message = {type: type, text: messageMap[fieldId]}
    } else {
      newFieldsMap[fieldId].message = null
    }

    return newFieldsMap
  }, {})
}

export default {
  updateFieldValue,
  updateDateFieldValue,
  resetFieldValues,
  resetFieldMessages,
  resetFieldValuesAndMessages,
  setFieldMessages
}
