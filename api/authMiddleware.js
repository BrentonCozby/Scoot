const {resolve} = require('path')
const jwt = require('jsonwebtoken')
const { to } = require('@utils/index.js')
const { get } = require('@services/accounts/queries/index.js')

require('dotenv').config({ path: resolve('api.env') })

async function authMiddleware(req, res, next) {
  const selectFields = ['email', 'first_name', 'last_name', 'roles']

  const encodedToken = String(req.headers.authorization || '').includes('Bearer ')
    ? req.headers.authorization.split('Bearer ')[1]
    : ''
  const jwtPayload = jwt.verify(encodedToken, new Buffer.from(process.env.JWT_SECRET, 'base64'))

  const [getErr, result] = await to(get({
    where: {
      accountId: jwtPayload.accountId
    },
    selectFields
  }))

  if (getErr) {
    return next(getErr)
  }

  req.user = result && result.length
    ? {
      accountId: result[0].accountId,
      email: result[0].email,
      firstName: result[0].firstName,
      lastName: result[0].lastName,
      roles: result[0].roles
    }
    : false

  next()
}

module.exports.authMiddleware = authMiddleware
module.exports.JWT_SECRET = process.env.JWT_SECRET
