const router = require('express-promise-router')()
const { authMiddleware } = require('@root/authMiddleware.js')
const { verifyOneOfRolesMiddleware, validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res) {
  const validation = validateRequiredParams(['scooterId'], req.body)

  if (!validation.isValid) {
    return res.status(409).json({
      message: 'Missing parameters',
      messageMap: validation.messageMap
    })
  }

  const [deleteErr, result] = await to(queries.deleteScooter({ scooterId: req.body.scooterId }))

  if (deleteErr) {
    console.error('\nError:\n', deleteErr);
    return res.status(500).json({ message: 'Internal server error.' })
  }

  if (result.rowCount === 0) {
    return res.status(500).json({ message: 'Scooter not deleted.' })
  }

  res.json({ message: `Scooter deleted with scooterId: ${req.body.scooterId}` })
}

router.delete('*',
  authMiddleware,
  verifyOneOfRolesMiddleware(['admin', 'manager']),
  routeHandler)

module.exports = router
