const router = require('express-promise-router')()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { getAccountByEmail } = require('./queries/index.js')
const { validateRequiredParams, to } = require('@utils/index.js')
const { JWT_SECRET } = require('../../authMiddleware.js')

async function routeHandler(req, res) {
  const email = req.body.email
  const password = req.body.password

  const validation = validateRequiredParams(['email', 'password'], req.body)

  if (!validation.isValid) {
    return res.status(409).json({
      message: 'Missing parameters',
      messageMap: validation.messageMap
    })
  }

  let [getAccountErr, account] = await to(getAccountByEmail({ email }))

  if (getAccountErr) {
    console.error('\nError:\n', getAccountErr);
    return res.status(500).json({
      message: 'Internal server error.'
    })
  }

  if (!account){
    res.status(401).json({
      message: 'Invalid login',
      messageMap: {
        email: 'Invalid login'
      }
    })

    return
  }

  bcrypt.compare(password, account.passwordHash)
  .then(isMatch => {
    if (!isMatch) {
      return Promise.reject()
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
  })
  .catch(err => {
    res
    .status(401)
    .json({
      message: 'Invalid login',
      messageMap: {
        password: 'Invalid login'
      }
    })
  })
}

router.post('*', routeHandler)

module.exports = router
