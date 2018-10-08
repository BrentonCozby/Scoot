const router = require('express-promise-router')()
const { authMiddleware } = require('@root/authMiddleware.js')
const queries = require('./queries/index.js')
const { verifyOneOfRoles, validateRequiredParams, to } = require('@utils/index.js')

async function routeHandler(req, res) {
  const validation = validateRequiredParams(['accountId', 'newPassword'], req.body)

  if (!validation.isValid) {
    return res.status(409).json({
      message: 'Missing parameters',
      messageMap: validation.messageMap
    })
  }

  let isAuthorizedByRole = true

  if (req.body.accountId !== req.user.accountId) {
    const rolesList = (req.user.roles || '').split(' ')

    isAuthorizedByRole = verifyOneOfRoles(['admin', 'manager'], rolesList)
  }

  if (!isAuthorizedByRole) {
    return res.status(403).json({
      message: 'Forbidden by role. Cannot change password of another account.',
      roles: req.user.roles
    })
  }

  const [err, result] = await to(queries.updateAccountPassword({
    accountId: req.body.accountId,
    newPassword: req.body.newPassword
  }))

  if (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error.' })
  }

  if (result.rowCount === 0) {
    return res.status(500).json({ message: 'Password not updated.' })
  }

  res.json({ message: `Password updated for accountId: ${req.body.accountId}` })
}

router.put('*',
  authMiddleware,
  routeHandler)

module.exports = router
