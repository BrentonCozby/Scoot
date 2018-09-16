const router = require('express-promise-router')()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { jwtOptions } = require('@root/passport.js')
const { getAccountByEmail } = require('./queries/index.js')
const { validateRequiredParams, to } = require('@utils/index.js')

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
    console.log(getAccountErr);
    return res.status(500).json({
      message: 'Internal server error.'
    })
  }

  if (!account){
    res.status(409).json({
      message: 'Invalid email',
      messageMap: {
        email: 'Invalid email'
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

    const token = jwt.sign(tokenPayload, jwtOptions.secretOrKey)

    res.json({
      accessToken: token,
      message: 'Token created'
    })
  })
  .catch(err => {
    console.log(err);
    res.status(409).json({
      message: 'Invalid password',
      messageMap: {
        password: 'Invalid password'
      }
    })
  })
}

router.post('*', routeHandler)

module.exports = router
