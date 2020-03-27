const {resolve} = require('path')
const jwt = require('jsonwebtoken')
const { to } = require('@utils/index.js')
const {get: getAccounts} = require('./services/accounts/queries')

require('dotenv').config({ path: resolve('api.env') })

async function authMiddleware(req, res, next) {
  const selectFields = ['email', 'first_name', 'last_name', 'roles']

  const encodedToken = String(req.headers.authorization || '').includes('Bearer ')
    ? req.headers.authorization.split('Bearer ')[1]
    : ''
  const jwtPayload = jwt.verify(encodedToken, new Buffer.from(process.env.JWT_SECRET, 'base64'))

  const [getAccountsErr, accounts] = await to(getAccounts({
    selectFields,
    where: {
      accountId: jwtPayload.accountId
    }
  }))

  if (getAccountsErr) {
    return next(getAccountsErr)
  }

  req.user = accounts && accounts[0]
    ? {
      accountId: accounts[0].accountId,
      email: accounts[0].email,
      firstName: accounts[0].firstName,
      lastName: accounts[0].lastName,
      roles: accounts[0].roles
    }
    : false

  next()
}

module.exports.authMiddleware = authMiddleware
module.exports.JWT_SECRET = process.env.JWT_SECRET
