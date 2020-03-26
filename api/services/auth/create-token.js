const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { getAccountByEmail } = require('./queries/index.js')
const { validateRequiredParams, to } = require('@utils/index.js')
const { JWT_SECRET } = require('../../authMiddleware.js')

async function routeHandler(req, res, next) {
  const {email, password} = req.query

  const queryValidation = validateRequiredParams(['email', 'password'], req.query)

  if (!queryValidation.isValid) {
    return res.status(400).json({
      message: 'Missing parameters',
      queryParamsErrors: queryValidation.messageMap
    })
  }

  let [getAccountErr, account] = await to(getAccountByEmail({ email }))

  if (getAccountErr) {
    return next(getAccountErr)
  }

  const [bcryptErr, isMatch] = await to(bcrypt.compare(password, account.passwordHash))

  if (bcryptErr) {
    return next(bcryptErr)
  }

  if (!account || !isMatch) {
    return res.status(401).json({
      message: 'Invalid login',
      requestBodyErrors: {
        email: 'Invalid login'
      }
    })
  }

  const tokenPayload = {
    accountId: account.accountId,
    firstName: account.firstName,
    lastName: account.lastName,
    roles: account.roles,
    expirationMs: new Date().getTime() + parseInt(process.env.TOKEN_EXPIRATION_MS)
  }

  const token = jwt.sign(tokenPayload, new Buffer.from(JWT_SECRET, 'base64'))

  res.json({
    accessToken: token,
    message: 'Token created'
  })
}

module.exports = [routeHandler]
