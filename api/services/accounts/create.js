const router = require('express-promise-router')()
const { validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')
const santizeHtml = require('sanitize-html')

async function routeHandler(req, res) {
  const email = req.body.email
  const password = req.body.password
  const firstName = req.body.firstName
  const lastName = req.body.lastName
  const roles = req.body.roles

  const validation = validateRequiredParams(['email', 'password', 'firstName', 'lastName'], req.body)

  if (!validation.isValid) {
    return res.status(409).json({
      message: 'Missing parameters',
      messageMap: validation.messageMap
    })
  }

  let [getErr, account] = await to(queries.getWhere({
    where: { email }
  }))

  if (getErr) {
    console.error(getErr);
    return res.status(500).json({ message: 'Internal server error.' })
  }

  if (account && account.length) {
    return res.status(409).json({
      message: `Account already exists with email: ${santizeHtml(email)}.`,
      messageMap: {
        email: 'Email already exists'
      }
    })
  }

  const [createErr, result] = await to(queries.createAccount({ email, password, firstName, lastName, roles }))

  if (createErr) {
    console.error(createErr);
    return res.status(500).json({ message: 'Internal server error.' })
  }

  if (result.rowCount === 0) {
    return res.status(500).json({ message: 'Account not created.' })
  }

  res.json({ message: 'Account created.' })
}

router.post('*',
  routeHandler
)

module.exports = router
