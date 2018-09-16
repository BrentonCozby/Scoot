const jwt = require('jsonwebtoken')
const { to } = require('@utils/index.js')
const { getWhere } = require('@services/accounts/queries/index.js')

require('dotenv').config({ path: '../api.env' })

async function authMiddleware(req, res, next) {
  const selectFields = ['email', 'first_name', 'last_name', 'roles']

  const encodedToken = String(req.headers.authorization || '').includes('Bearer ')
    ? req.headers.authorization.split('Bearer ')[1]
    : ''
  const jwtPayload = jwt.verify(encodedToken, new Buffer(process.env.JWT_SECRET, 'base64'))

  const [err, result] = await to(getWhere({
    where: {
      accountId: jwtPayload.accountId
    },
    selectFields
  }))

  if (err) {
    console.log(err)
    return next(err, false)
  }

  if (result && result.length) {
    return next(null, {
      accountId: result[0].accountId,
      email: result[0].email,
      firstName: result[0].firstName,
      lastName: result[0].lastName,
      roles: result[0].roles
    })
  } else {
    return next(null, false)
  }
}

module.exports.authMiddleware = authMiddleware
module.exports.JWT_SECRET = process.env.JWT_SECRET
