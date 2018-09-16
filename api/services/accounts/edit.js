const router = require('express-promise-router')()
const { passport } = require('@root/passport.js')
const { verifyOneOfRolesMiddleware, validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res) {
  const validation = validateRequiredParams(['accountId', 'updateMap'], req.body)

  if (!validation.isValid) {
    return res.status(409).json({
      message: 'Missing parameters',
      messageMap: validation.messageMap
    })
  }

  const [updateErr, result] = await to(queries.updateAccount({
    accountId: req.body.accountId,
    updateMap: req.body.updateMap
  }))

  if (updateErr) {
    console.log(err);
    return res.status(500).json({ message: 'Internal server error.' })
  }

  if (result.rowCount === 0) {
    return res.status(500).json({ message: 'Account not updated.' })
  }

  res.json({ message: `Account updated with accountId: ${req.body.accountId}` })
}

router.put('*',
  passport.authenticate('jwt', { session: false }),
  verifyOneOfRolesMiddleware(['admin', 'manager']),
  routeHandler)

module.exports = router
