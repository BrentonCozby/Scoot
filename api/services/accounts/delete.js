const router = require('express-promise-router')()
const { authMiddleware } = require('@root/authMiddleware.js')
const { verifyOneOfRolesMiddleware, validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res) {
  const validation = validateRequiredParams(['accountId'], req.body)

  if (!validation.isValid) {
    return res.status(409).json({
      message: 'Missing parameters',
      messageMap: validation.messageMap
    })
  }

  const [err, result] = await to(queries.deleteAccount({ accountId: req.body.accountId }))

  if (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error.' })
  }

  if (result.rowCount === 0) {
    return res.status(500).json({ message: 'Account not deleted.' })
  }

  res.json({ message: `Account deleted with accountId: ${req.body.accountId}` })
}

router.delete('*',
  authMiddleware,
  verifyOneOfRolesMiddleware(['admin', 'manager']),
  routeHandler)

module.exports = router
