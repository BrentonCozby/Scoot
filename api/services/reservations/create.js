const router = require('express-promise-router')()
const { authMiddleware } = require('@root/authMiddleware.js')
const { validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res, next) {
  const accountId = req.body.accountId
  const scooterId = req.body.scooterId
  const data = req.body.data

  const validation = validateRequiredParams(['accountId', 'scooterId', 'data'], req.body)

  if (!validation.isValid) {
    return res.status(409).json({
      message: 'Missing parameters',
      messageMap: validation.messageMap
    })
  }

  const [createErr, result] = await to(queries.create({ accountId, scooterId, data }))

  if (createErr) {
    console.log(createErr);
    return res.status(500).json({ message: 'Internal server error.' })
  }

  if (result.rowCount === 0) {
    return res.status(500).json({ message: 'Reservation not created.' })
  }

  res.json({ message: 'Reservation created', rows: result.rows })
}

router.post('*',
  authMiddleware,
  routeHandler)

module.exports = router
