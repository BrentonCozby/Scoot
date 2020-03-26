const sanitizeHtml = require('sanitize-html')
const {
  includesOneOf,
  includesEvery,
  decamelizeList,
  camelCaseMapKeys,
  to,
  validateRequiredValues
} = require('brenton-js-utils')

function verifyAllRoles(rolesToVerify, rolesList) {
  return includesEvery({requiredValues: rolesToVerify, actualValues: rolesList})
}

function verifyAllRolesMiddleware(rolesToVerify) {
  return function (req, res, next) {
    const rolesList = (req.user.roles || '').split(' ')

    const allRolesFound = verifyAllRoles(rolesToVerify, rolesList)

    return allRolesFound
      ? Promise.resolve('next')
      : res.status(403).json({ message: 'Forbidden by roles' })
  }
}

function verifyOneOfRoles(rolesToVerify, rolesList) {
  return includesOneOf({requiredValues: rolesToVerify, actualValues: rolesList})
}

function verifyOneOfRolesMiddleware(rolesToVerify) {
  return function (req, res, next) {
    const rolesList = (req.user.roles || '').split(' ')

    const oneOfRolesFound = verifyOneOfRoles(rolesToVerify, rolesList)

    return oneOfRolesFound
      ? Promise.resolve('next')
      : res.status(403).json({ message: 'Forbidden by role' })
  }
}

function sanitize(values) {
  return values.map(val => sanitizeHtml(val))
}

function validateRequiredParams(requiredParamsList, givenParams) {
  return validateRequiredValues({requiredKeys: requiredParamsList, valuesMap: givenParams})
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
