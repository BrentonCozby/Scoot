const sanitizeHtml = require('sanitize-html')
const camelCase = require('camelcase')
const decamelize = require('decamelize')

function verifyAllRoles(rolesToVerify, rolesList) {
  return rolesToVerify.every(role => {
    return rolesList.includes(role)
  })
}

function verifyAllRolesMiddleware(rolesToVerify) {
  return function (req, res, next) {
    const rolesList = (req.user.roles || '').split(' ')

    const allRolesFound = verifyAllRoles(rolesToVerify, rolesList)

    return allRolesFound
      ? Promise.resolve('next')
      : res.status(401).json({ message: 'One or more required account roles are missing.' })
  }
}

function verifyOneOfRoles(rolesToVerify, rolesList) {
  return rolesToVerify.some(role => {
    return rolesList.includes(role)
  })
}

function verifyOneOfRolesMiddleware(rolesToVerify) {
  return function (req, res, next) {
    const rolesList = (req.user.roles || '').split(' ')

    const oneOfRolesFound = verifyOneOfRoles(rolesToVerify, rolesList)

    return oneOfRolesFound
      ? Promise.resolve('next')
      : res.status(401).json({ message: 'Required account role not found.' })
  }
}

function sanitize(values) {
  return values.map(val => sanitizeHtml(val))
}

function camelCaseMapKeys(map) {
  if (!map) {
    return map
  }

  return Object.entries(map).reduce((newMap, [key, value]) => {
    newMap[camelCase(key)] = value

    return newMap
  }, {})
}

function decamelizeList(list) {
  return list.map(str => decamelize(str))
}

function validateRequiredParams(requiredParamsList, givenParams) {
  let isValid = true
  let messageMap = {}

  requiredParamsList.forEach(key => {
    if (!givenParams[key]) {
      isValid = false
      messageMap[key] = 'Required'
    }
  })

  return {
    isValid,
    messageMap
  }
}

function to(promise) {
   return promise.then(data => {
      return [null, data];
   })
   .catch(err => [err]);
}

module.exports.verifyAllRoles = verifyAllRoles
module.exports.verifyAllRolesMiddleware = verifyAllRolesMiddleware
module.exports.verifyOneOfRoles = verifyOneOfRoles
module.exports.verifyOneOfRolesMiddleware = verifyOneOfRolesMiddleware
module.exports.sanitize = sanitize
module.exports.camelCaseMapKeys = camelCaseMapKeys
module.exports.decamelizeList = decamelizeList
module.exports.validateRequiredParams = validateRequiredParams
module.exports.to = to
